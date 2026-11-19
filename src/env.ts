import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value;

export const variables = defineEnvVars({
	CONTACT_EMAIL: { schema: optional },
	EMAIL_FROM: { schema: optional },
	EMAIL_SERVICE: { schema: optional },
	EMAIL_TO: { schema: optional },
	RESEND_API_KEY: { schema: optional },
	SENDGRID_API_KEY: { schema: optional }
});
