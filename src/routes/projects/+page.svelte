<script lang="ts">
	import type { Project } from '$lib/types';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import DbErrorBanner from '$lib/components/DbErrorBanner.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let { data } = $props<{ data: { projects: Project[]; dbError?: boolean } }>();

	const categories = [
		{ id: 'all', name: 'All Projects' },
		{ id: 'frontend', name: 'Frontend' },
		{ id: 'backend', name: 'Backend' },
		{ id: 'fullstack', name: 'Full Stack' }
	];

	let selectedCategory = $state('all');

	const filteredProjects = $derived(
		selectedCategory === 'all'
			? data.projects
			: data.projects.filter((project: Project) => project.category === selectedCategory)
	);

	const featuredProjects = $derived(
		selectedCategory === 'all' ? filteredProjects.filter((p: Project) => p.featured) : []
	);

	const gridProjects = $derived(
		selectedCategory === 'all'
			? filteredProjects.filter((p: Project) => !p.featured)
			: filteredProjects
	);
</script>

<SeoHead
	title="Projects"
	description="Portfolio projects across frontend, backend, and full stack."
/>

<div class="mx-auto max-w-6xl">
	{#if data.dbError}
		<DbErrorBanner pageName="Projects" />
	{/if}

	<div class="mb-12 text-center">
		<span
			class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
		>
			Portfolio
		</span>
		<h1
			class="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl"
		>
			My Projects
		</h1>
		<p class="mx-auto max-w-3xl text-xl text-secondary">
			Here are some of the projects I've worked on. Each one represents a unique challenge and
			learning experience.
		</p>
	</div>

	<CategoryFilter
		{categories}
		selectedId={selectedCategory}
		onSelect={(id) => (selectedCategory = id)}
	/>

	{#if featuredProjects.length > 0}
		<div class="mb-16">
			<h2 class="mb-8 font-headline text-2xl font-bold text-on-surface">Featured Projects</h2>
			<div class="grid gap-8 lg:grid-cols-2">
				{#each featuredProjects as project (project.id)}
					<ProjectCard {project} />
				{/each}
			</div>
		</div>
	{/if}

	<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each gridProjects as project (project.id)}
			<ProjectCard {project} />
		{/each}
	</div>

	{#if filteredProjects.length === 0 && !data.dbError}
		<div class="py-16 text-center">
			<h2 class="mb-2 font-headline text-xl font-bold text-on-surface">No projects found</h2>
			<p class="text-secondary">Try selecting a different category to see more projects.</p>
		</div>
	{/if}
</div>
