<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ContactInfoRow from '$lib/components/ContactInfoRow.svelte';

	let { data } = $props<{ data: PageData }>();

	// superForm intentionally captures initial server form state once
	const { form, errors, submitting, message } = superForm(untrack(() => data.form));

	const site = $derived(data.site);
	const meta = $derived(site?.metadata);
	const contactData = $derived({
		name: site?.name ?? 'Aaron Howard',
		email: meta?.email ?? '',
		location: site?.location ?? '',
		phone: meta?.phone ?? '',
		socialLinks: {
			github: meta?.github ?? '',
			linkedin: meta?.linkedin ?? '',
			bluesky: meta?.bluesky ?? '',
			email: meta?.email ? `mailto:${meta.email}` : ''
		},
		availability: meta?.availability ?? '',
		responseTime: meta?.responseTime ?? ''
	});

	// Auto-clear success message after 5 seconds
	$effect(() => {
		if ($message) {
			const timeout = setTimeout(() => {
				$message = '';
			}, 5000);
			return () => clearTimeout(timeout);
		}
	});
</script>

<SeoHead
	title="Contact"
	description="Get in touch about opportunities, collaborations, or questions."
/>

<div class="mx-auto max-w-6xl">
	<!-- Header -->
	<div class="mb-12 text-center">
		<span
			class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
		>
			Contact
		</span>
		<h1
			class="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl"
		>
			Get in touch
		</h1>
		<p class="mx-auto max-w-3xl text-xl text-secondary">
			I'm always interested in hearing about new opportunities, collaborations, or just having a
			chat about technology and development.
		</p>
	</div>

	<div class="grid gap-12 lg:grid-cols-2">
		<!-- Contact Information -->
		<div class="space-y-8">
			<!-- Personal Info -->
			<div class="rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
				<h2 class="mb-6 font-headline text-2xl font-bold text-on-surface">Contact information</h2>

				<div class="space-y-6">
					<ContactInfoRow label="Name">
						{#snippet icon()}
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						{/snippet}
						<p class="text-secondary">{contactData.name}</p>
					</ContactInfoRow>

					<ContactInfoRow label="Email">
						{#snippet icon()}
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						{/snippet}
						<a href={`mailto:${contactData.email}`} class="text-primary hover:underline"
							>{contactData.email}</a
						>
					</ContactInfoRow>

					<ContactInfoRow label="Location">
						{#snippet icon()}
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						{/snippet}
						<p class="text-secondary">{contactData.location}</p>
					</ContactInfoRow>

					<ContactInfoRow label="Phone">
						{#snippet icon()}
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
						{/snippet}
						<a href={`tel:${contactData.phone}`} class="text-primary hover:underline"
							>{contactData.phone}</a
						>
					</ContactInfoRow>
				</div>
			</div>

			<!-- Social Links -->
			<div class="rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
				<h2 class="mb-6 font-headline text-2xl font-bold text-on-surface">Follow me</h2>

				<div class="grid grid-cols-2 gap-4">
					<a
						href={contactData.socialLinks.github}
						class="flex items-center gap-3 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
					>
						<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						<span class="font-medium text-on-surface">GitHub</span>
					</a>

					<a
						href={contactData.socialLinks.linkedin}
						class="flex items-center gap-3 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
					>
						<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
							/>
						</svg>
						<span class="font-medium text-on-surface">LinkedIn</span>
					</a>

					<a
						href={contactData.socialLinks.bluesky}
						class="flex items-center gap-3 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
					>
						<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.22-.257.427-.352.62-1.2 2.445-1.03 4.267.39 5.006.813.426 1.925.27 3.04-.456 1.115-.726 2.07-1.89 2.7-3.163.63-1.273.95-2.54.95-3.72 0-.69-.378-5.65-.624-6.479-.815-2.736-3.713-3.66-6.383-3.364-.136.02-.275.039-.415.056.138-.22.257-.427.352-.62 1.2-2.445 1.03-4.267-.39-5.006-.813-.426-1.925-.27-3.04.456z"
							/>
						</svg>
						<span class="font-medium text-on-surface">BlueSky</span>
					</a>

					<a
						href={contactData.socialLinks.email}
						class="flex items-center gap-3 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						<span class="font-medium text-on-surface">Email</span>
					</a>
				</div>
			</div>

			<!-- Availability -->
			<div class="rounded-xl bg-primary-container p-8 text-on-primary-container">
				<h2 class="mb-4 font-headline text-2xl font-bold">Current availability</h2>
				<p class="mb-4 text-on-primary-container">{contactData.availability}</p>
				<p class="text-on-primary-container">{contactData.responseTime}</p>
			</div>
		</div>

		<!-- Contact Form -->
		<div class="rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
			<h2 class="mb-6 font-headline text-2xl font-bold text-on-surface">Send a message</h2>

			{#if $message}
				<div
					class="mb-6 rounded-md border border-primary/30 bg-primary-fixed-dim/15 p-4 text-on-surface"
				>
					{$message}
				</div>
			{/if}

			<form method="POST" class="flex flex-col gap-10">
				<!-- Honeypot: hidden from real users; bots that fill it fail validation -->
				<div class="sr-only" aria-hidden="true">
					<label for="website">Website</label>
					<input
						type="text"
						id="website"
						name="website"
						bind:value={$form.website}
						tabindex="-1"
						autocomplete="off"
					/>
				</div>
				{#if $errors.website}
					<p class="mb-4 text-sm text-red-600" role="alert">{$errors.website}</p>
				{/if}
				<div>
					<label
						for="name"
						class="mb-2 block text-xs font-medium uppercase tracking-widest text-secondary"
						>Name</label
					>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={$form.name}
						aria-invalid={$errors.name ? 'true' : undefined}
						class="w-full border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 text-on-surface placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 {$errors.name
							? 'border-b-red-500'
							: ''}"
						placeholder="Your name"
					/>
					{#if $errors.name}
						<p class="mt-1 text-sm text-red-600">{$errors.name}</p>
					{/if}
				</div>

				<div>
					<label
						for="email"
						class="mb-2 block text-xs font-medium uppercase tracking-widest text-secondary"
						>Email</label
					>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						class="w-full border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 text-on-surface placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 {$errors.email
							? 'border-b-red-500'
							: ''}"
						placeholder="your.email@example.com"
					/>
					{#if $errors.email}
						<p class="mt-1 text-sm text-red-600">{$errors.email}</p>
					{/if}
				</div>

				<div>
					<label
						for="subject"
						class="mb-2 block text-xs font-medium uppercase tracking-widest text-secondary"
						>Subject</label
					>
					<input
						type="text"
						id="subject"
						name="subject"
						bind:value={$form.subject}
						aria-invalid={$errors.subject ? 'true' : undefined}
						class="w-full border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 text-on-surface placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 {$errors.subject
							? 'border-b-red-500'
							: ''}"
						placeholder="What's this about?"
					/>
					{#if $errors.subject}
						<p class="mt-1 text-sm text-red-600">{$errors.subject}</p>
					{/if}
				</div>

				<div>
					<label
						for="message"
						class="mb-2 block text-xs font-medium uppercase tracking-widest text-secondary"
						>Message</label
					>
					<textarea
						id="message"
						name="message"
						bind:value={$form.message}
						aria-invalid={$errors.message ? 'true' : undefined}
						rows="5"
						class="w-full resize-none border-0 border-b border-outline-variant/40 bg-transparent px-0 py-2 text-on-surface placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 {$errors.message
							? 'border-b-red-500'
							: ''}"
						placeholder="Tell me about your project, opportunity, or just say hello!"></textarea>
					{#if $errors.message}
						<p class="mt-1 text-sm text-red-600">{$errors.message}</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={$submitting}
					class="scale-102 w-full rounded-md bg-primary py-4 font-headline font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
				>
					{$submitting ? 'Sending...' : 'Send message'}
				</button>
			</form>
		</div>
	</div>
</div>
