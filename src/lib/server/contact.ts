import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from '$lib/server/superforms-zod4';
import { CONTACT_EMAIL, EMAIL_TO } from '$app/env/private';
import { sendEmail, formatContactEmail } from '$lib/server/email';
import { contactFormSchema } from '$lib/schemas';
import { handleFormError, toError } from '$lib/server/error-handler';
import { recordContactSubmission } from '$lib/observability/app-metrics';
import { stripHtmlTags } from '$lib/server/sanitize-utils';

function normalizeTextInput(value: string): string {
	return stripHtmlTags(value).trim();
}

export type ContactMailer = {
	sendEmail: typeof sendEmail;
	formatContactEmail: typeof formatContactEmail;
};

const defaultMailer: ContactMailer = { sendEmail, formatContactEmail };

export async function submitContact(request: Request, mailer: ContactMailer = defaultMailer) {
	const form = await superValidate(request, zod4(contactFormSchema));

	if (!form.valid) {
		recordContactSubmission('validation_error');
		return fail(400, { form });
	}

	try {
		const submitted = contactFormSchema.parse(form.data);
		const name = normalizeTextInput(submitted.name);
		const email = normalizeTextInput(submitted.email);
		const subject = normalizeTextInput(submitted.subject);
		const messageText = normalizeTextInput(submitted.message);

		const recipientEmail = CONTACT_EMAIL || EMAIL_TO || 'admin@example.com';
		const emailContent = mailer.formatContactEmail({
			name,
			email,
			subject,
			message: messageText
		});

		const emailResult = await mailer.sendEmail({
			to: recipientEmail,
			subject: `Contact Form: ${subject.replace(/[\r\n]/g, ' ')}`,
			html: emailContent.html,
			text: emailContent.text
		});

		if (!emailResult.success) {
			console.error('Failed to send contact email:', emailResult.error);
			recordContactSubmission('delivery_error');
			return message(form, 'Message delivery failed. Please try again later.');
		}

		recordContactSubmission('success');
		return message(form, "Thank you! I'll get back to you soon.");
	} catch (cause) {
		const error = toError(cause);
		recordContactSubmission('delivery_error');
		const errorMessage = handleFormError(error, 'contact').error;
		return fail(400, { form, message: errorMessage });
	}
}
