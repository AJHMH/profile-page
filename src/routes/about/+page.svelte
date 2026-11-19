<script lang="ts">
	import { dev } from '$app/env';
	import type { PageData } from './$types';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let { data } = $props<{ data: PageData }>();
	const bio = $derived(data.bio);

	/** Display order for skill categories (keys in skillCategories JSON) */
	const SKILL_CATEGORY_ORDER = [
		'Languages & runtimes',
		'Frontend & UI',
		'Backend & APIs',
		'Data & persistence',
		'Styling & CSS',
		'AI, ML & documents',
		'Python tooling & automation',
		'Testing, quality & observability',
		'Auth, cloud & delivery',
		'Enterprise platforms'
	] as const;

	const orderedSkillSections = $derived.by(() => {
		if (!bio) return [];
		const map = bio.skillCategories;
		const fromOrder = SKILL_CATEGORY_ORDER.filter((title) => map[title]?.length).map((title) => ({
			title,
			items: map[title] ?? []
		}));
		const extras = Object.keys(map)
			.filter((k) => !SKILL_CATEGORY_ORDER.some((title) => title === k) && map[k]?.length)
			.map((title) => ({ title, items: map[title] ?? [] }));
		return [...fromOrder, ...extras];
	});

	const experience = $derived(bio?.experience ?? []);
</script>

<SeoHead
	title="About"
	description="Background, skills, and work experience of Aaron Howard — full stack developer."
/>

<div class="mx-auto max-w-4xl">
	{#if data.dbError}
		<div
			class="rounded-xl border border-outline-variant/30 bg-surface-container-low p-10 text-center md:p-14"
		>
			<h1 class="mb-4 font-headline text-2xl font-bold text-on-surface md:text-3xl">
				Profile could not be loaded
			</h1>
			<p class="mb-8 text-secondary">
				The database is unavailable or misconfigured. For <strong>Vercel</strong>, add
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">DATABASE_URL</code>
				under Project → Settings → Environment Variables, redeploy, then run
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm"
					>npm run db:seed:bio</code
				>
				(or use Prisma Studio) so the
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">bio</code>
				table has a row with
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">id = 1</code>. For
				<strong>local</strong>
				development, copy
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">.env.example</code>
				to
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">.env</code>, start
				PostgreSQL, and run
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm">npm run db:push</code>
				then
				<code class="rounded bg-surface-container-high px-1.5 py-0.5 text-sm"
					>npm run db:seed:bio</code
				>.
			</p>
			<a
				href="/"
				class="inline-block rounded-md bg-primary px-6 py-3 font-headline font-semibold text-on-primary"
				>Back to home</a
			>
		</div>
	{:else if data.bio}
		{#if dev && data.devBioFallback}
			<div
				class="mx-auto mb-8 max-w-4xl rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-on-surface"
				role="status"
			>
				<strong class="font-semibold">Dev:</strong> Could not reach PostgreSQL. Showing a
				placeholder profile. Set
				<code class="rounded bg-surface-container-high px-1">DATABASE_URL</code> in
				<code class="rounded bg-surface-container-high px-1">.env</code>, start the database, then
				run
				<code class="rounded bg-surface-container-high px-1">npm run db:push</code> and
				<code class="rounded bg-surface-container-high px-1">npm run db:seed:bio</code>.
			</div>
		{/if}
		<header class="mb-16 md:mb-24">
			<span
				class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
			>
				Profile
			</span>
			<h1 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-6xl">
				The philosophy of craft in every line of code.
			</h1>
			<p class="mt-8 max-w-2xl text-lg leading-relaxed text-secondary">
				{bio!.about}
			</p>
		</header>

		<section class="mb-20 grid gap-12 md:grid-cols-2 md:items-start md:gap-20">
			<div
				class="flex aspect-[4/5] items-center justify-center rounded-xl bg-surface-container-highest font-headline text-7xl font-extrabold text-primary/25"
				aria-hidden="true"
			>
				{bio.name
					.split(' ')
					.map((n: string) => n[0])
					.join('')}
			</div>
			<div class="flex flex-col gap-8">
				<h2
					class="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl"
				>
					{bio.name}
				</h2>
				<p class="text-lg text-secondary">{bio.title} · {bio.location}</p>
			</div>
		</section>

		<section class="mb-20 rounded-xl bg-surface-container-low p-8 md:p-12">
			<h2 class="mb-10 font-headline text-2xl font-bold text-on-surface md:text-3xl">
				Skills & technologies
			</h2>

			<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
				{#each orderedSkillSections as section (section.title)}
					<div>
						<h3
							class="mb-4 font-body text-sm font-semibold uppercase tracking-widest text-secondary"
						>
							{section.title}
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each section.items as item (section.title + item)}
								<span
									class="rounded px-2 py-1 text-xs font-medium uppercase tracking-wide text-secondary bg-secondary-container/10"
									>{item}</span
								>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		{#if experience.length > 0}
			<section class="mb-20">
				<h2 class="mb-12 font-headline text-2xl font-bold text-on-surface md:text-3xl">
					Work experience
				</h2>

				<div class="flex flex-col gap-14">
					{#each experience as job (job.title + job.company + job.period)}
						<div>
							<div
								class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"
							>
								<h3 class="font-headline text-xl font-bold text-on-surface">{job.title}</h3>
								<span class="font-body text-sm text-secondary">{job.period}</span>
							</div>
							<p class="mb-3 font-headline font-semibold text-primary">{job.company}</p>
							<p class="max-w-3xl leading-relaxed text-secondary">{job.description}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
