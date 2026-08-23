<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		icon,
		children
	}: {
		label: string;
		icon: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="flex items-center gap-4">
	<div
		class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container/20 text-primary"
	>
		{@render icon()}
	</div>
	<div>
		<h3 class="font-medium text-on-surface">{label}</h3>
		{@render children()}
	</div>
</div>
