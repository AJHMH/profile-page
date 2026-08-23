import { z } from 'zod';

/** Reject CRLF in single-line fields (email header injection) */
const noControlLines = (value: string) => !/[\r\n]/.test(value);

const singleLineString = (max: number, label: string) =>
	z
		.string()
		.min(1, `${label} is required`)
		.max(max, `${label} must be ${max} characters or less`)
		.trim()
		.refine(noControlLines, `${label} cannot contain line breaks`);

/**
 * Contact form validation schema
 * Validates name, email, subject, and message fields
 */
export const contactFormSchema = z.object({
	name: singleLineString(100, 'Name'),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.max(255, 'Email must be 255 characters or less')
		.trim()
		.toLowerCase()
		.refine(noControlLines, 'Email cannot contain line breaks'),
	subject: singleLineString(200, 'Subject'),
	message: z
		.string()
		.min(1, 'Message is required')
		.max(5000, 'Message must be 5,000 characters or less')
		.trim(),
	/** Honeypot — must stay empty */
	website: z.string().max(0, 'Invalid submission').default('')
});
