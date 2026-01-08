/**
 * Enhanced Error Handling System for NABIDH AI
 * Provides comprehensive error tracking, logging, and user-friendly messages
 */

export type ErrorType = 
    | 'NETWORK_ERROR'
    | 'API_ERROR'
    | 'AUTH_ERROR'
    | 'VALIDATION_ERROR'
    | 'DATABASE_ERROR'
    | 'UNKNOWN_ERROR';

export interface AppError {
    type: ErrorType;
    message: string;
    userMessage: string;
    code?: string;
    details?: any;
    timestamp: Date;
}

class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: AppError[] = [];
    private maxLogSize = 100;

    private constructor() {}

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Handle and log errors with appropriate user messages
     */
    handle(error: any, context?: string): AppError {
        const appError: AppError = {
            type: this.determineErrorType(error),
            message: this.extractErrorMessage(error),
            userMessage: this.getUserFriendlyMessage(error),
            code: error.code,
            details: { context, original: error },
            timestamp: new Date()
        };

        this.log(appError);
        return appError;
    }

    /**
     * Determine the type of error
     */
    private determineErrorType(error: any): ErrorType {
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            return 'NETWORK_ERROR';
        }
        if (error.message?.includes('API') || error.response) {
            return 'API_ERROR';
        }
        if (error.message?.includes('auth') || error.message?.includes('session')) {
            return 'AUTH_ERROR';
        }
        if (error.message?.includes('validation') || error.message?.includes('invalid')) {
            return 'VALIDATION_ERROR';
        }
        if (error.message?.includes('database') || error.message?.includes('Supabase')) {
            return 'DATABASE_ERROR';
        }
        return 'UNKNOWN_ERROR';
    }

    /**
     * Extract error message from various error formats
     */
    private extractErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.error) return error.error;
        if (error.statusText) return error.statusText;
        return 'Unknown error occurred';
    }

    /**
     * Convert technical errors to user-friendly Arabic messages
     */
    private getUserFriendlyMessage(error: any): string {
        const msg = this.extractErrorMessage(error).toLowerCase();

        // Network errors
        if (msg.includes('network') || msg.includes('fetch failed')) {
            return 'فشل الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
        }

        // API errors
        if (msg.includes('api') || msg.includes('unauthorized')) {
            return 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.';
        }

        // Authentication errors
        if (msg.includes('session') || msg.includes('expired')) {
            return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
        }

        // Validation errors
        if (msg.includes('validation') || msg.includes('invalid')) {
            return 'البيانات المدخلة غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.';
        }

        // Database errors
        if (msg.includes('database') || msg.includes('supabase')) {
            return 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.';
        }

        // Rate limiting
        if (msg.includes('rate limit') || msg.includes('too many requests')) {
            return 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
        }

        // Quota exceeded
        if (msg.includes('quota') || msg.includes('exceeded')) {
            return 'تم استنفاد الحصة المتاحة. يرجى المحاولة لاحقاً أو الترقية لخطة أعلى.';
        }

        // Default message
        return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.';
    }

    /**
     * Log error to console and internal storage
     */
    private log(error: AppError): void {
        // Console logging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('🚨 Error:', {
                type: error.type,
                message: error.message,
                userMessage: error.userMessage,
                timestamp: error.timestamp,
                details: error.details
            });
        }

        // Store in memory (limited to maxLogSize)
        this.errorLog.push(error);
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
    }

    /**
     * Get recent errors (useful for debugging)
     */
    getRecentErrors(count: number = 10): AppError[] {
        return this.errorLog.slice(-count);
    }

    /**
     * Clear error log
     */
    clearLog(): void {
        this.errorLog = [];
    }

    /**
     * Check if error is recoverable
     */
    isRecoverable(error: AppError): boolean {
        return error.type === 'NETWORK_ERROR' || error.type === 'API_ERROR';
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * Utility function to handle async operations with error handling
 */
export async function handleAsync<T>(
    operation: () => Promise<T>,
    context?: string
): Promise<{ data: T | null; error: AppError | null }> {
    try {
        const data = await operation();
        return { data, error: null };
    } catch (err) {
        const error = errorHandler.handle(err, context);
        return { data: null, error };
    }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
    
    throw errorHandler.handle(lastError, `Failed after ${maxRetries} attempts`);
}
