import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from '$lib/server/superforms-zod4';
import { contactFormSchema } from '$lib/schemas';
import { submitContact } from '$lib/server/contact';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(contactFormSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => submitContact(request)
};
