import { ErrorCode } from './enums/error-code.enum';

/**
 * Interface for normalized errors used throughout the application.
 */
export interface AppError {
    code: ErrorCode;
    message: string;
    originalError?: any;
    timestamp: Date;
    status?: number;
}
