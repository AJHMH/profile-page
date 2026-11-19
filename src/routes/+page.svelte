<script lang="ts">
	import { dev } from '$app/env';
	import type { PageData } from './$types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProjectPicture from '$lib/components/ProjectPicture.svelte';

	let { data } = $props<{ data: PageData }>();

	const social = $derived(data.site?.metadata);

	const bio = $derived(data.bio);
	const headline = $derived(bio?.title ?? 'Full Stack Developer');
	const tagline = $derived(
		bio?.about?.slice(0, 160) ??
			'I specialize in crafting high-performance web applications where architectural integrity meets exceptional user experience.'
	);

	const featuredProjects = $derived(data.featuredProjects ?? []);
	const latestPosts = $derived(data.latestPosts ?? []);

	/** When a project image path has no file in /static, fall back to the gradient placeholder */
	let imageLoadFailed = $state<Record<number, boolean>>({});

	function formatPostDate(date: string | Date) {
		const d = date instanceof Date ? date : new Date(date);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function projectGridClass(index: number): string {
		const layouts = [
			'md:col-span-8',
			'md:col-span-4',
			'md:col-span-4 md:mt-12',
			'md:col-span-8 md:-mt-24 lg:-mt-32'
		];
		return layouts[index] ?? 'md:col-span-6';
	}

	function aspectClass(index: number): string {
		if (index === 0 || index === 3) return 'aspect-[16/10]';
		return 'aspect-square';
	}
</script>

<SeoHead title={`Aaron Howard — ${headline}`} description={tagline} />

{#if dev && 'dbError' in data && data.dbError}
	<div
		class="mx-auto mb-4 max-w-7xl rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-on-surface"
		role="status"
	>
		<strong class="font-semibold">Dev:</strong> Home page data failed to load (database). Check
		<code class="rounded bg-surface-container-high px-1">DATABASE_URL</code> and Vercel env vars.
	</div>
{/if}

<!-- Hero -->
<section class="pb-16 pt-8 md:pb-24 md:pt-12">
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
			<div class="lg:col-span-8">
				<span
					class="mb-6 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
				>
					{headline} &amp; digital craft
				</span>
				<h1
					class="font-headline text-5xl font-extrabold leading-[0.95] tracking-tighter text-on-surface md:text-7xl lg:text-8xl"
				>
					Building digital <br class="hidden sm:block" /> experiences <br class="hidden sm:block" />
					with <span class="text-primary italic">precision</span>.
				</h1>
			</div>
			<div class="flex flex-col gap-8 pb-2 lg:col-span-4">
				<p class="max-w-sm text-lg leading-relaxed text-secondary">
					{tagline}{#if bio?.about && bio.about.length > 160}…{/if}
				</p>
				<div class="flex flex-wrap items-center gap-6">
					<a
						href="/projects"
						class="scale-102 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-headline font-bold text-on-primary"
					>
						View Work
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</a>
					<div class="flex gap-4">
						<a
							href={social?.github ?? '#'}
							class="text-secondary transition-colors hover:text-primary"
							aria-label="GitHub"
						>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
								/>
							</svg>
						</a>
						<a
							href={social?.linkedin ?? '#'}
							class="text-secondary transition-colors hover:text-primary"
							aria-label="LinkedIn"
						>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Explore -->
<section class="bg-surface-container-low py-20 md:py-28 -mx-6 px-6 md:-mx-8 md:px-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-14 flex flex-col gap-4 md:mb-20 md:flex-row md:items-end md:justify-between">
			<div>
				<span
					class="mb-3 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
				>
					Navigate
				</span>
				<h2
					class="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl"
				>
					Explore the <span class="text-primary">studio</span>
				</h2>
			</div>
			<p class="max-w-md text-secondary md:text-right">
				About, projects, writing, and contact — same story, different rooms.
			</p>
		</div>

		<div class="grid gap-10 md:grid-cols-2">
			<a
				href="/about"
				class="group block rounded-xl bg-surface-container-lowest p-8 shadow-ambient md:p-10"
			>
				<span class="text-xs font-medium uppercase tracking-widest text-primary">01</span>
				<h3
					class="mt-4 font-headline text-2xl font-bold text-on-surface group-hover:text-primary md:text-3xl"
				>
					About
				</h3>
				<p class="mt-3 text-secondary">Background, skills, and how I work.</p>
				<span
					class="mt-6 inline-block font-headline font-bold text-on-surface underline decoration-primary-fixed-dim decoration-2 underline-offset-4 transition-colors group-hover:decoration-primary"
				>
					Read more
				</span>
			</a>
			<a
				href="/projects"
				class="group block rounded-xl bg-surface-container-lowest p-8 shadow-ambient md:p-10"
			>
				<span class="text-xs font-medium uppercase tracking-widest text-primary">02</span>
				<h3
					class="mt-4 font-headline text-2xl font-bold text-on-surface group-hover:text-primary md:text-3xl"
				>
					Projects
				</h3>
				<p class="mt-3 text-secondary">Selected builds and technical snapshots.</p>
				<span
					class="mt-6 inline-block font-headline font-bold text-on-surface underline decoration-primary-fixed-dim decoration-2 underline-offset-4 transition-colors group-hover:decoration-primary"
				>
					View work
				</span>
			</a>
			<a
				href="/blog"
				class="group block rounded-xl bg-surface-container-lowest p-8 shadow-ambient md:p-10"
			>
				<span class="text-xs font-medium uppercase tracking-widest text-primary">03</span>
				<h3
					class="mt-4 font-headline text-2xl font-bold text-on-surface group-hover:text-primary md:text-3xl"
				>
					Blog
				</h3>
				<p class="mt-3 text-secondary">Notes on development and delivery.</p>
				<span
					class="mt-6 inline-block font-headline font-bold text-on-surface underline decoration-primary-fixed-dim decoration-2 underline-offset-4 transition-colors group-hover:decoration-primary"
				>
					Open journal
				</span>
			</a>
			<a
				href="/contact"
				class="group block rounded-xl bg-surface-container-lowest p-8 shadow-ambient md:p-10"
			>
				<span class="text-xs font-medium uppercase tracking-widest text-primary">04</span>
				<h3
					class="mt-4 font-headline text-2xl font-bold text-on-surface group-hover:text-primary md:text-3xl"
				>
					Contact
				</h3>
				<p class="mt-3 text-secondary">Collaborations, opportunities, or a quick hello.</p>
				<span
					class="mt-6 inline-block font-headline font-bold text-on-surface underline decoration-primary-fixed-dim decoration-2 underline-offset-4 transition-colors group-hover:decoration-primary"
				>
					Get in touch
				</span>
			</a>
		</div>
	</div>
</section>

<!-- Featured projects -->
{#if featuredProjects.length > 0}
	<section class="py-20 md:py-28" id="projects">
		<div class="mx-auto max-w-7xl">
			<div class="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
				<div class="max-w-xl">
					<span
						class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
					>
						Selected works
					</span>
					<h2 class="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
						Curation of <span class="text-primary">impact</span>
					</h2>
				</div>
				<a
					href="/projects"
					class="hidden rounded-md bg-surface-container-high px-6 py-3 font-headline font-semibold text-secondary transition-colors hover:bg-surface-container md:inline-block"
				>
					Explore all
				</a>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-12">
				{#each featuredProjects.slice(0, 4) as project, i (project.id)}
					<article class="group cursor-pointer {projectGridClass(i)}">
						<a href="/projects/{project.id}" class="block">
							<div
								class="relative mb-6 overflow-hidden rounded-xl bg-surface-container-low {aspectClass(
									i
								)}"
							>
								{#if project.image && !imageLoadFailed[project.id]}
									<ProjectPicture
										imagePath={project.image}
										alt=""
										class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-focus-within:scale-105"
										loading="lazy"
										imgError={() => {
											imageLoadFailed = { ...imageLoadFailed, [project.id]: true };
										}}
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary-fixed-dim/20"
									>
										<span class="font-headline text-4xl font-extrabold text-primary/40"
											>{project.title.slice(0, 1)}</span
										>
									</div>
								{/if}
								<div
									class="absolute inset-0 flex items-center justify-center bg-on-surface/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
								>
									<span class="font-body text-sm font-semibold text-white">View project →</span>
								</div>
							</div>
							<div class="flex items-start justify-between gap-4">
								<div>
									<h3 class="mb-2 font-headline text-xl font-bold text-on-surface md:text-2xl">
										{project.title}
									</h3>
									<div class="flex flex-wrap gap-2">
										{#each project.technologies.slice(0, 3) as tech (tech)}
											<span
												class="rounded px-2 py-1 text-xs font-medium uppercase tracking-widest text-secondary bg-secondary-container/10"
												>{tech}</span
											>
										{/each}
									</div>
								</div>
							</div>
						</a>
					</article>
				{/each}
			</div>

			<div class="mt-10 md:hidden">
				<a
					href="/projects"
					class="block w-full rounded-md bg-surface-container-high py-3 text-center font-headline font-semibold text-secondary"
				>
					Explore all
				</a>
			</div>
		</div>
	</section>
{/if}

<!-- Blog teaser -->
{#if latestPosts.length > 0}
	<section
		class="bg-surface-container-highest py-20 md:py-28 -mx-6 px-6 md:-mx-8 md:px-8"
		id="blog"
	>
		<div class="mx-auto flex max-w-7xl flex-col gap-16 md:flex-row md:gap-20">
			<div class="md:w-1/3">
				<span
					class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
				>
					Reflections
				</span>
				<h2 class="mb-8 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
					Thoughts on <br /> technical design.
				</h2>
				<p class="mb-8 text-secondary">
					Deep dives into delivery, accessibility, and front-end architecture.
				</p>
				<a href="/blog" class="inline-flex items-center gap-2 font-headline font-bold text-primary">
					View archive
					<svg
						class="h-4 w-4 transition-transform group-hover:translate-x-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</a>
			</div>
			<div class="flex flex-col gap-10 md:w-2/3">
				{#each latestPosts as post (post.id)}
					<a
						href="/blog/{post.id}"
						class="group flex flex-col justify-between gap-4 border-b border-outline-variant/30 pb-8 sm:flex-row sm:items-end"
					>
						<div>
							<span class="mb-3 block text-xs font-medium uppercase tracking-widest text-primary"
								>{post.category}</span
							>
							<h3
								class="font-headline text-2xl font-bold text-on-surface transition-colors group-hover:text-primary md:text-3xl"
							>
								{post.title}
							</h3>
						</div>
						<span class="shrink-0 font-body text-sm text-secondary sm:ml-4"
							>{formatPostDate(post.date)}</span
						>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Contact CTA -->
<section class="py-20 md:py-28">
	<div class="mx-auto max-w-7xl">
		<div
			class="relative flex flex-col items-center gap-12 overflow-hidden rounded-xl bg-primary-container p-10 md:flex-row md:gap-16 md:p-20"
		>
			<div
				class="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/4 -translate-y-1/2 rounded-full bg-primary-fixed-dim/20 blur-3xl"
			></div>
			<div class="relative z-10 md:w-1/2">
				<h2
					class="mb-8 font-headline text-4xl font-extrabold tracking-tighter text-on-primary-container md:text-6xl"
				>
					Let's start <br /> a conversation.
				</h2>
				<p class="mb-10 text-xl leading-relaxed text-on-primary-container">
					Have a project in mind or want to collaborate? Reach out — I typically respond within a
					day.
				</p>
				<div class="flex flex-col gap-3 font-headline text-xl font-bold text-on-primary-container">
					<a
						href={social?.email ? `mailto:${social.email}` : '#'}
						class="transition-colors hover:text-primary-fixed-dim"
					>
						{social?.email ?? ''}
					</a>
				</div>
			</div>
			<div class="relative z-10 w-full md:w-1/2">
				<div class="rounded-lg bg-surface-container-lowest p-8 shadow-ambient md:p-10">
					<p class="mb-6 text-secondary">
						Prefer a form? Send a message from the contact page — same inbox, structured fields.
					</p>
					<a
						href="/contact"
						class="scale-102 inline-flex w-full items-center justify-center rounded-md bg-primary py-4 font-headline font-bold text-on-primary"
					>
						Open contact
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
