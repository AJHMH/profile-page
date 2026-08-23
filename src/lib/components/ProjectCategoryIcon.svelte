<script lang="ts">
	import { getProjectCategoryColor, getProjectCategoryIconKey } from '$lib/project-utils';
	import CategoryDatabaseIcon from '$lib/components/CategoryDatabaseIcon.svelte';

	let { category, size = 80 }: { category: string; size?: number } = $props();

	const color = $derived(getProjectCategoryColor(category));
	const icon = $derived(getProjectCategoryIconKey(category));
</script>

<svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
	{#if icon === 'window'}
		<rect x="12" y="12" width="56" height="56" rx="4" stroke={color} stroke-width="3" />
		<line x1="12" y1="28" x2="68" y2="28" stroke={color} stroke-width="2" />
		<line x1="40" y1="12" x2="40" y2="68" stroke={color} stroke-width="2" stroke-dasharray="4,4" />
	{:else if icon === 'database'}
		<CategoryDatabaseIcon {color} />
	{:else if icon === 'layers'}
		<rect x="10" y="12" width="60" height="16" rx="2" stroke={color} stroke-width="3" fill="none" />
		<rect x="14" y="32" width="60" height="16" rx="2" stroke={color} stroke-width="3" fill="none" />
		<rect x="18" y="52" width="60" height="16" rx="2" stroke={color} stroke-width="3" fill="none" />
	{:else}
		<rect x="20" y="20" width="40" height="40" rx="4" stroke={color} stroke-width="3" fill="none" />
	{/if}
</svg>
