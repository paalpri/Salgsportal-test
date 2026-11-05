<script lang="ts">
	import { site } from '#lib/site.ts';
	import { cn } from '#lib/utils.ts';

	let { class: className = '', showName = true }: { class?: string; showName?: boolean } = $props();
</script>

<span class={cn('flex items-center gap-2 font-semibold', className)}>
	<svg viewBox="0 0 32 32" class="size-8! shrink-0" aria-hidden="true">
		<rect width="32" height="32" rx="8" class="fill-primary" />
		<path
			d="M8 15.5 16 9l8 6.5V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1z"
			class="fill-primary-foreground"
		/>
	</svg>
	{#if showName}<span class="truncate">{site.name}</span>{/if}
</span>
