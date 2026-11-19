import { EMAIL_FROM, EMAIL_SERVICE, RESEND_API_KEY, SENDGRID_API_KEY } from '$app/env/private';
import { tracer } from '$lib/observability/tracer';
import { escapeHtml } from './sanitize-utils';

interface EmailData {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

/**
 * Send email using environment-configured service
 * Supports SMTP or external services like SendGrid, Resend, etc.
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
	return tracer.startActiveSpan('email.send', async (span) => {
		const domain = data.to.includes('@') ? data.to.split('@').at(-1) : undefined;
		if (domain) {
			span.setAttribute('email.domain', domain);
		}
		try {
			return await actualSendEmail(data);
		} finally {
			span.end();
		}
	});
}

async function actualSendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
	const emailService = EMAIL_SERVICE || 'console'; // console, smtp, resend, sendgrid

	if (process.env.NODE_ENV === 'production' && emailService === 'console') {
		console.error('EMAIL_SERVICE=console is not allowed in production');
		return {
			success: false,
			error: 'Email service is not configured for production'
		};
	}

	try {
		switch (emailService) {
			case 'console':
				console.log('=== EMAIL ===');
				console.log('To:', data.to);
				console.log('Subject:', data.subject);
				console.log('Body:', data.text || data.html);
				console.log('=============');
				return { success: true };

			case 'smtp':
				return await sendViaSMTP(data);

			case 'resend':
				return await sendViaResend(data);

			case 'sendgrid':
				return await sendViaSendGrid(data);

			default:
				console.warn(`Unknown email service: ${emailService}`);
				return {
					success: false,
					error: `Unknown email service: ${emailService}`
				};
		}
	} catch (error) {
		console.error('Error sending email:', error);
		return { success: false, error: 'Failed to send email' };
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- stub implementation
async function sendViaSMTP(_data: EmailData): Promise<{ success: boolean; error?: string }> {
	// Implement SMTP sending using nodemailer or similar
	// For now, return error suggesting configuration
	return {
		success: false,
		error:
			'SMTP email service not implemented. Please configure EMAIL_SERVICE environment variable.'
	};
}

async function sendViaResend(data: EmailData): Promise<{ success: boolean; error?: string }> {
	const apiKey = RESEND_API_KEY;
	if (!apiKey) {
		throw new Error('RESEND_API_KEY environment variable is not set');
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: EMAIL_FROM || 'onboarding@resend.dev',
			to: data.to,
			subject: data.subject,
			html: data.html,
			text: data.text
		}),
		signal: AbortSignal.timeout(15_000)
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Resend API error: ${error}`);
	}

	return { success: true };
}

async function sendViaSendGrid(data: EmailData): Promise<{ success: boolean; error?: string }> {
	const apiKey = SENDGRID_API_KEY;
	if (!apiKey) {
		throw new Error('SENDGRID_API_KEY environment variable is not set');
	}

	const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			personalizations: [
				{
					to: [{ email: data.to }]
				}
			],
			from: { email: EMAIL_FROM || 'noreply@example.com' },
			subject: data.subject,
			content: [
				{ type: 'text/html', value: data.html },
				...(data.text ? [{ type: 'text/plain', value: data.text }] : [])
			]
		}),
		signal: AbortSignal.timeout(15_000)
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`SendGrid API error: ${error}`);
	}

	return { success: true };
}

export interface ContactMessage {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface FormattedContactEmail {
	html: string;
	text: string;
}

export function formatContactEmail(data: ContactMessage): FormattedContactEmail {
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
				.content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
				.field { margin-bottom: 15px; }
				.label { font-weight: bold; color: #4f46e5; }
				.message { background-color: white; padding: 15px; border-left: 4px solid #4f46e5; margin-top: 10px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>New Contact Form Submission</h1>
				</div>
				<div class="content">
					<div class="field">
						<span class="label">Name:</span> ${escapeHtml(data.name)}
					</div>
					<div class="field">
						<span class="label">Email:</span> ${escapeHtml(data.email)}
					</div>
					<div class="field">
						<span class="label">Subject:</span> ${escapeHtml(data.subject)}
					</div>
					<div class="message">
						<span class="label">Message:</span><br>
						${escapeHtml(data.message).replace(/\n/g, '<br>')}
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	const text = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
	`.trim();

	return { html, text };
}
