<script lang="ts">
	import { site } from '#lib/site.ts';
	import { cn } from '#lib/utils.ts';

	type Props = { class?: string; showName?: boolean; inverted?: boolean };
	let { class: className = '', showName = true, inverted = false }: Props = $props();
</script>

<span class={cn('flex items-center gap-2.5', className)}>
	<svg viewBox="0 0 32 32" class="size-8! shrink-0" aria-hidden="true">
		<rect width="32" height="32" rx="3" class={inverted ? 'fill-white' : 'fill-brand'} />
		<path
			d="M8 15.5 16 9l8 6.5V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1z"
			class={inverted ? 'fill-brand' : 'fill-white'}
		/>
	</svg>
	{#if showName}
		<span class="grid leading-tight">
			<span class="truncate text-[15px] font-medium tracking-tight">{site.name}</span>
			<span class="truncate text-xs opacity-70">Kommuneportalen</span>
		</span>
	{/if}
</span>
