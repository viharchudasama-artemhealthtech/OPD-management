import { Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ErrorCode } from '../models/enums/error-code.enum';
import { AppError } from '../models/error-response.model';
import { LoggerService } from './logger.service';

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {

    private lastErrorMessage = '';
    private lastErrorTime = 0;
    private readonly DEBOUNCE_TIME = 2000; // 2 seconds to prevent spam

    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly logger: LoggerService
    ) {  }

    public normalizeError(error: HttpErrorResponse): AppError {

        let code = ErrorCode.UNKNOWN_ERROR;
        let message = 'An unexpected error occurred. Please try again later.';

        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            code = ErrorCode.NETWORK_ERROR;
            message = error.error.message;
        } else {
            // Server-side error
            code = this.getErrorCode(error.status);
            message = this.getErrorMessage(error);
        }

        return {
            code,
            message,
            originalError: error,
            timestamp: new Date(),
            status: error.status,
        };
    }

    /**
     * Handles the error by showing notifications and performing side effects (like logout).
     */
    public handleError(error: AppError): void {

        if (this.shouldSuppressNotification(error.message)) {
            return;
        }

        // Centralized handling for authentication errors
        if (error.code === ErrorCode.UNAUTHORIZED) {
            this.handleUnauthorized();
        } else if (error.code === ErrorCode.FORBIDDEN) {
            this.handleForbidden();
        }

        const summary = this.getErrorSummary(error.code);
        this.notificationService.showError(summary, error.message);

        // Development-only logging
        if (isDevMode()) {
            this.logger.debug('GlobalErrorHandler', 'Error details', {
                code: error.code,
                status: error.status,
                message: error.message,
                original: error.originalError,
            });
        }
    }

    private getErrorCode(status: number): ErrorCode {
        switch (status) {
            case 0: return ErrorCode.NETWORK_ERROR;
            case 400: return ErrorCode.BAD_REQUEST;
            case 401: return ErrorCode.UNAUTHORIZED;
            case 403: return ErrorCode.FORBIDDEN;
            case 404: return ErrorCode.NOT_FOUND;
            case 409: return ErrorCode.CONFLICT;
            case 422: return ErrorCode.VALIDATION_ERROR;
            case 500: return ErrorCode.SERVER_ERROR;
            default: return ErrorCode.UNKNOWN_ERROR;
        }
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        // If server provides a specific message, use it
        if (error.error?.message) {
            return error.error.message;
        }

        // Default messages based on status
        switch (error.status) {
            case 0: return 'Network connection failed. Please check your internet.';
            case 401: return 'Your session has expired. Please log in again.';
            case 403: return 'You do not have permission to perform this action.';
            case 404: return 'The requested resource was not found.';
            case 500: return 'Our server encountered an internal error. We are working on it.';
            default: return `Error Code: ${error.status}. Please contact support if this persists.`;
        }
    }

    private getErrorSummary(code: ErrorCode): string {
        switch (code) {
            case ErrorCode.NETWORK_ERROR: return 'Connection Error';
            case ErrorCode.UNAUTHORIZED: return 'Authentication Failed';
            case ErrorCode.FORBIDDEN: return 'Access Denied';
            case ErrorCode.VALIDATION_ERROR: return 'Invalid Data';
            case ErrorCode.SERVER_ERROR: return 'System Error';
            default: return 'Unexpected Error';
        }
    }

    private handleUnauthorized(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    private handleForbidden(): void {
        this.router.navigate(['/unauthorized']);
    }

    private shouldSuppressNotification(message: string): boolean {
        const now = Date.now();
        const isSameMessage = message === this.lastErrorMessage;
        const isTooSoon = now - this.lastErrorTime < this.DEBOUNCE_TIME;

        if (isSameMessage && isTooSoon) {
            return true;
        }

        this.lastErrorMessage = message;
        this.lastErrorTime = now;
        return false;
    }
}
