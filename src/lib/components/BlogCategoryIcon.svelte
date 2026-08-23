<script lang="ts">
	import { getBlogCategoryColor, getBlogCategoryIconKey } from '$lib/blog-utils';
	import CategoryDatabaseIcon from '$lib/components/CategoryDatabaseIcon.svelte';

	let { category, size = 80 }: { category: string; size?: number } = $props();

	const color = $derived(getBlogCategoryColor(category));
	const icon = $derived(getBlogCategoryIconKey(category));
</script>

<svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
	{#if icon === 'code'}
		<path
			d="M 25 20 L 15 40 L 25 60"
			stroke={color}
			stroke-width="3"
			fill="none"
			stroke-linecap="round"
		/>
		<path
			d="M 55 20 L 65 40 L 55 60"
			stroke={color}
			stroke-width="3"
			fill="none"
			stroke-linecap="round"
		/>
		<line x1="35" y1="15" x2="45" y2="65" stroke={color} stroke-width="3" stroke-linecap="round" />
	{:else if icon === 'chip'}
		<rect x="20" y="20" width="40" height="40" rx="4" stroke={color} stroke-width="3" fill="none" />
		<circle cx="30" cy="30" r="3" fill={color} />
		<circle cx="50" cy="30" r="3" fill={color} />
		<circle cx="30" cy="50" r="3" fill={color} />
		<circle cx="50" cy="50" r="3" fill={color} />
	{:else if icon === 'database'}
		<CategoryDatabaseIcon {color} />
	{:else if icon === 'palette'}
		<circle cx="40" cy="40" r="20" stroke={color} stroke-width="3" fill="none" />
		<circle cx="28" cy="28" r="3" fill={color} />
		<circle cx="52" cy="28" r="3" fill={color} />
		<circle cx="28" cy="52" r="3" fill={color} />
		<circle cx="52" cy="52" r="3" fill={color} />
	{:else if icon === 'deploy'}
		<rect x="15" y="25" width="25" height="25" rx="2" stroke={color} stroke-width="2" fill="none" />
		<rect x="40" y="30" width="25" height="25" rx="2" stroke={color} stroke-width="2" fill="none" />
	{:else}
		<rect x="20" y="12" width="40" height="56" rx="4" stroke={color} stroke-width="3" fill="none" />
		<line x1="26" y1="24" x2="54" y2="24" stroke={color} stroke-width="2" />
		<line x1="26" y1="34" x2="54" y2="34" stroke={color} stroke-width="2" />
		<line x1="26" y1="44" x2="54" y2="44" stroke={color} stroke-width="2" />
	{/if}
</svg>
