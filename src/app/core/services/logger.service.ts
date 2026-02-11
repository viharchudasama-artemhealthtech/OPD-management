/** Angular core dependency for dependency injection */
import { Injectable, isDevMode } from '@angular/core';

/**
 * Centralized logging service that enforces company standards.
 * 
 * **Company Standards:**
 * - Never use console.log
 * - Use console.error for errors
 * - Use console.warn for warnings
 * 
 * **Purpose:**
 * Provides a single point of control for all application logging,
 * making it easy to add features like remote logging, filtering, and log levels.
 * 
 * **Usage:**
 * Inject this service and use error(), warn(), or debug() methods instead of direct console usage.
 */
@Injectable({
    providedIn: 'root',
})
export class LoggerService {

    /**
     * Logs an error message with context.
     * 
     * @param context - Service or component name (e.g., 'DataSyncService', 'LoginComponent')
     * @param message - Human-readable error message
     * @param error - Optional error object or additional data
     * 
     * @example
     * this.logger.error('UserService', 'Failed to load users', error);
     */
    public error(context: string, message: string, error?: unknown): void {
        console.error(`[${context}] ${message}`, error || '');
    }

    /**
     * Logs a warning message with context.
     * 
     * @param context - Service or component name
     * @param message - Human-readable warning message
     * @param data - Optional additional data
     * 
     * @example
     * this.logger.warn('ConfigService', 'Using default configuration', { config });
     */
    public warn(context: string, message: string, data?: unknown): void {
        console.warn(`[${context}] ${message}`, data || '');
    }

    /**
     * Logs debug information (only in development mode).
     * Production builds will not execute this code.
     * 
     * @param context - Service or component name
     * @param message - Debug message
     * @param data - Optional debug data
     * 
     * @example
     * this.logger.debug('ApiService', 'Request sent', { url, params });
     */
    public debug(context: string, message: string, data?: unknown): void {
        if (isDevMode()) {
            console.error(`[DEBUG][${context}] ${message}`, data || '');
        }
    }
}
