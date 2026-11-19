/**
 * Centralized error handling utilities
 * Provides consistent error logging and user-friendly error messages
 */

import { dev } from '$app/env';

export interface AppErrorDetails {
	readonly [key: string]: string | number | boolean | null;
}

export interface AppError {
	code: string;
	message: string;
	statusCode: number;
	details?: AppErrorDetails;
	timestamp: string;
}

export interface FormErrorResult {
	error: string;
}

/** Decode a catch-clause value into an Error at the I/O boundary. */
export function toError(cause: unknown): Error {
	return cause instanceof Error ? cause : new Error(String(cause));
}

/**
 * Log an error with appropriate context
 * In development: logs full details to console
 * In production: logs sanitized info (no sensitive data)
 *
 * @param error - The error to log
 * @param context - Additional context (function name, action, etc.)
 * @param isDev - Whether to log the raw error object
 */
export function logError(error: Error, context: string, isDev = dev): void {
	const timestamp = new Date().toISOString();

	if (isDev) {
		console.error(`[${timestamp}] Error in ${context}:`, error);
	} else {
		console.error(`[${timestamp}] Error in ${context}: ${error.message}`);
	}
}

/**
 * Create a user-friendly error message from an Error
 * Sanitizes sensitive information in production
 *
 * @param error - The error object
 * @param defaultMessage - Fallback message if error can't be determined
 * @param isDev - Whether to surface the raw error message
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(
	error: Error,
	defaultMessage = 'An unexpected error occurred. Please try again.',
	isDev = dev
): string {
	if (isDev) {
		return error.message;
	}

	return defaultMessage;
}

/**
 * Create a standardized error object
 *
 * @param code - Error code (e.g., 'FORM_VALIDATION_ERROR')
 * @param message - User-friendly message
 * @param statusCode - HTTP status code
 * @param details - Optional error details (only in dev)
 * @param isDev - Whether to attach details
 * @returns Standardized error object
 */
export function createAppError(
	code: string,
	message: string,
	statusCode: number = 500,
	details?: AppErrorDetails,
	isDev = dev
): AppError {
	const base: AppError = {
		code,
		message,
		statusCode,
		timestamp: new Date().toISOString()
	};
	if (isDev && details !== undefined) {
		base.details = details;
	}
	return base;
}

/**
 * Handle form submission errors
 * Returns appropriate response format for SvelteKit forms
 *
 * @param error - The error that occurred
 * @param formName - Name of the form (for logging)
 * @param isDev - Whether to surface the raw error message
 * @returns Object with user-friendly error message
 */
export function handleFormError(error: Error, formName: string, isDev = dev): FormErrorResult {
	logError(error, `form: ${formName}`, isDev);

	const message =
		isDev && error.message ? error.message : 'Unable to process your request. Please try again.';

	return { error: message };
}

/**
 * Handle API/database errors
 * Provides different messaging for different error types
 *
 * @param error - The error that occurred
 * @param operation - What operation was being performed
 * @param isDev - Whether to surface the raw error message
 * @returns User-friendly error message
 */
export function handleOperationError(error: Error, operation: string, isDev = dev): string {
	logError(error, operation, isDev);

	const msg = error.message.toLowerCase();

	if (msg.includes('not found')) {
		return 'The requested resource was not found.';
	}
	if (msg.includes('unauthorized')) {
		return 'You do not have permission to perform this action.';
	}
	if (msg.includes('timeout')) {
		return 'Request timed out. Please try again.';
	}
	if (msg.includes('network')) {
		return 'Network error. Please check your connection.';
	}

	return isDev ? error.message : 'An error occurred. Please try again.';
}

/**
 * Create a 404 error response
 *
 * @param message - Custom 404 message
 * @returns Error object
 */
export function notFoundError(message = 'Page not found'): AppError {
	return createAppError('NOT_FOUND', message, 404);
}

/**
 * Create a 500 error response
 *
 * @param message - Custom 500 message
 * @param details - Error details (only shown in dev)
 * @param isDev - Whether to attach details
 * @returns Error object
 */
export function internalServerError(
	message = 'An unexpected error occurred',
	details?: AppErrorDetails,
	isDev = dev
): AppError {
	return createAppError('INTERNAL_SERVER_ERROR', message, 500, details, isDev);
}

/**
 * Create a validation error response
 *
 * @param message - Validation error message
 * @returns Error object
 */
export function validationError(message: string): AppError {
	return createAppError('VALIDATION_ERROR', message, 400);
}
