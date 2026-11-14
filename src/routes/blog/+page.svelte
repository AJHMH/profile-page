<script lang="ts">
	import type { BlogPost } from '$lib/types';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import DbErrorBanner from '$lib/components/DbErrorBanner.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let { data } = $props<{ data: { posts: BlogPost[]; dbError?: boolean } }>();

	type CategoryOption = { id: string; name: string };

	const categories = $derived.by((): CategoryOption[] => {
		const names: string[] = data.posts.map((post: BlogPost) => post.category);
		const unique = [...new Set(names)];
		unique.sort((left, right) => left.localeCompare(right));
		return [{ id: 'all', name: 'All Posts' }, ...unique.map((id) => ({ id, name: id }))];
	});

	let selectedCategory = $state('all');

	$effect(() => {
		if (selectedCategory !== 'all' && !categories.some((c) => c.id === selectedCategory)) {
			selectedCategory = 'all';
		}
	});

	const filteredPosts = $derived(
		selectedCategory === 'all'
			? data.posts
			: data.posts.filter((post: BlogPost) => post.category === selectedCategory)
	);

	const featuredPosts = $derived(filteredPosts.filter((p: BlogPost) => p.featured));

	const nonFeaturedPosts = $derived(
		filteredPosts.filter((p: BlogPost) => !p.featured || selectedCategory !== 'all')
	);
</script>

<SeoHead title="Blog" description="Articles on web development, technology, and engineering." />

<div class="mx-auto max-w-6xl">
	{#if data.dbError}
		<DbErrorBanner pageName="The blog" />
	{/if}

	<div class="mb-12 text-center">
		<span
			class="mb-4 block font-body text-xs font-medium uppercase tracking-[0.3em] text-secondary"
		>
			Journal
		</span>
		<h1
			class="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl"
		>
			Blog
		</h1>
		<p class="mx-auto max-w-3xl text-xl text-secondary">
			Thoughts, tutorials, and insights about web development, technology, and the industry.
		</p>
	</div>

	<CategoryFilter
		{categories}
		selectedId={selectedCategory}
		onSelect={(id) => (selectedCategory = id)}
	/>

	{#if featuredPosts.length > 0}
		<div class="mb-16">
			<h2 class="mb-8 font-headline text-2xl font-bold text-on-surface">Featured Posts</h2>
			<div class="grid gap-8 lg:grid-cols-2">
				{#each featuredPosts as post (post.id)}
					<BlogCard {post} featured />
				{/each}
			</div>
		</div>
	{/if}

	<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each nonFeaturedPosts as post (post.id)}
			<BlogCard {post} />
		{/each}
	</div>

	{#if filteredPosts.length === 0 && !data.dbError}
		<div class="py-16 text-center">
			<h2 class="mb-2 font-headline text-xl font-bold text-on-surface">No posts found</h2>
			<p class="text-secondary">Try selecting a different category to see more blog posts.</p>
		</div>
	{/if}
</div>
