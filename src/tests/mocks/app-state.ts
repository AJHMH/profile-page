/** Vitest mock for `$app/state` */
export const page = {
	url: new URL('http://localhost/'),
	params: {},
	route: { id: null },
	status: 200,
	error: null,
	data: {},
	form: null,
	state: {}
};
export const navigating = { current: null };
export const updated = { current: false, check: async () => false };
