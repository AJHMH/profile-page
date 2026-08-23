<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<ellipse cx="40" cy="20" rx="16" ry="8" stroke={color} stroke-width="3" fill="none" />
<path
	d="M 24 20 L 24 60 Q 24 68 40 68 Q 56 68 56 60 L 56 20"
	stroke={color}
	stroke-width="3"
	fill="none"
/>
<ellipse cx="40" cy="60" rx="16" ry="8" stroke={color} stroke-width="2" fill="none" />
