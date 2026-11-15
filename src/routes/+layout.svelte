<script lang="ts">
	import '../app.css';
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ children: Snippet; data: LayoutData }>();

	let mobileMenuOpen = $state(false);
	let mobileMenuButtonEl = $state<HTMLButtonElement | undefined>(undefined);
	let mobileMenuPanelEl = $state<HTMLDivElement | undefined>(undefined);
	let mainEl = $state<HTMLElement | undefined>(undefined);

	const nav = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/contact', label: 'Contact' }
	];

	const siteName = $derived(data.site.name);

	function navClass(href: string, path: string): string {
		const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
		return active
			? 'font-headline font-bold tracking-tight text-on-surface border-b-2 border-primary pb-0.5'
			: 'font-headline font-bold tracking-tight text-secondary transition-colors duration-300 hover:text-on-surface';
	}

	// SvelteKit may handle same-page hash links without moving focus, so do it explicitly.
	function focusMainContent() {
		mainEl?.focus();
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		queueMicrotask(() => mobileMenuButtonEl?.focus());
	}

	function toggleMobileMenu() {
		if (mobileMenuOpen) {
			closeMobileMenu();
		} else {
			mobileMenuOpen = true;
		}
	}

	$effect(() => {
		if (!mobileMenuOpen) return;
		void tick().then(() => {
			mobileMenuPanelEl?.querySelector<HTMLElement>('a')?.focus();
		});
	});

	$effect(() => {
		if (!mobileMenuOpen) return;
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeMobileMenu();
			}
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="min-h-screen bg-background font-body text-on-surface antialiased">
	<a
		href="#main-content"
		class="skip-link rounded-md bg-primary px-4 py-2 font-headline font-bold text-on-primary"
		onclick={focusMainContent}
	>
		Skip to content
	</a>
	<nav
		class="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-xl backdrop-saturate-150"
		aria-label="Primary"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
			<a href="/" class="font-headline text-xl font-extrabold tracking-tighter text-on-surface">
				{siteName}
			</a>
			<div class="hidden items-center gap-10 md:flex">
				{#each nav as item (item.href)}
					<a href={item.href} class={navClass(item.href, page.url.pathname)}>{item.label}</a>
				{/each}
				<a
					href="/contact"
					class="scale-102 rounded-md bg-primary px-6 py-2 font-headline font-bold text-on-primary"
				>
					Hire Me
				</a>
			</div>
			<div class="md:hidden">
				<button
					type="button"
					bind:this={mobileMenuButtonEl}
					onclick={toggleMobileMenu}
					class="p-2 text-on-surface"
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-nav-panel"
				>
					{#if mobileMenuOpen}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
		{#if mobileMenuOpen}
			<div
				id="mobile-nav-panel"
				bind:this={mobileMenuPanelEl}
				class="border-t border-outline-variant/15 bg-surface/95 px-4 py-4 backdrop-blur-xl md:hidden"
			>
				<div class="flex flex-col gap-1">
					{#each nav as item (item.href)}
						<a
							href={item.href}
							class="rounded-md px-3 py-3 font-headline font-semibold text-on-surface"
							onclick={closeMobileMenu}
						>
							{item.label}
						</a>
					{/each}
					<a
						href="/contact"
						class="mt-2 rounded-md bg-primary px-3 py-3 text-center font-headline font-bold text-on-primary"
						onclick={closeMobileMenu}
					>
						Hire Me
					</a>
				</div>
			</div>
		{/if}
	</nav>

	<main
		id="main-content"
		bind:this={mainEl}
		tabindex="-1"
		class="w-full px-6 pb-16 pt-24 outline-none md:px-8 md:pt-28"
	>
		{@render children()}
	</main>

	<footer class="w-full bg-surface-container-highest py-16 md:py-20">
		<div
			class="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 md:flex-row md:justify-between md:px-8"
		>
			<a href="/" class="font-headline text-2xl font-bold text-on-surface">{siteName}</a>
			<nav class="flex flex-wrap justify-center gap-8 md:gap-12" aria-label="Footer">
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="font-body text-xs uppercase tracking-widest text-secondary transition-colors hover:text-primary"
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<p class="font-body text-center text-xs uppercase tracking-widest text-secondary">
				© {new Date().getFullYear()}
				{siteName}
			</p>
		</div>
	</footer>
</div>

<style>
	/* Visually hidden until focused; then pinned above the fixed nav (z-50). */
	.skip-link:not(:focus) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}

	.skip-link:focus {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 60;
	}
</style>
