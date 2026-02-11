import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

/**
 * Global HTTP Error Interceptor using Angular 17+ functional pattern.
 * Normalizes HTTP errors and delegates handling to the ErrorHandlerService.
 */
export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {

    const errorHandler = inject(ErrorHandlerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            // 1. Normalize the error using the dedicated service
            const normalizedError = errorHandler.normalizeError(error);

            // 2. Handle the error (notifications, redirects, logging)
            errorHandler.handleError(normalizedError);

            // 3. Re-throw the normalized error for downstream subscribers
            return throwError(() => normalizedError);

        })
    );
};


