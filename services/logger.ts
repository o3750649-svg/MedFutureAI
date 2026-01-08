/**
 * Logger Service for NABIDH AI
 * Provides structured logging with different levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: string;
    data?: any;
}

class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private maxLogs = 200;
    private isDevelopment = process.env.NODE_ENV === 'development';

    private constructor() {}

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, data?: any, context?: string): void {
        if (this.isDevelopment) {
            this.log('debug', message, data, context);
        }
    }

    /**
     * Log informational message
     */
    info(message: string, data?: any, context?: string): void {
        this.log('info', message, data, context);
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: any, context?: string): void {
        this.log('warn', message, data, context);
    }

    /**
     * Log error message
     */
    error(message: string, data?: any, context?: string): void {
        this.log('error', message, data, context);
    }

    /**
     * Internal logging method
     */
    private log(level: LogLevel, message: string, data?: any, context?: string): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
            data
        };

        // Store in memory
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with formatting
        this.outputToConsole(entry);
    }

    /**
     * Output formatted log to console
     */
    private outputToConsole(entry: LogEntry): void {
        const emoji = this.getEmojiForLevel(entry.level);
        const timestamp = entry.timestamp.toLocaleTimeString('en-US', { hour12: false });
        const contextStr = entry.context ? ` [${entry.context}]` : '';
        
        const logMessage = `${emoji} ${timestamp}${contextStr} ${entry.message}`;

        switch (entry.level) {
            case 'debug':
                console.debug(logMessage, entry.data || '');
                break;
            case 'info':
                console.info(logMessage, entry.data || '');
                break;
            case 'warn':
                console.warn(logMessage, entry.data || '');
                break;
            case 'error':
                console.error(logMessage, entry.data || '');
                break;
        }
    }

    /**
     * Get emoji for log level
     */
    private getEmojiForLevel(level: LogLevel): string {
        switch (level) {
            case 'debug': return '🔍';
            case 'info': return 'ℹ️';
            case 'warn': return '⚠️';
            case 'error': return '🚨';
            default: return '📝';
        }
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logs.filter(log => log.level === level);
    }

    /**
     * Get recent logs
     */
    getRecentLogs(count: number = 50): LogEntry[] {
        return this.logs.slice(-count);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export singleton instance
export const logger = Logger.getInstance();
