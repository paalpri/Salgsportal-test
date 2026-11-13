<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	type Props = { title: string; href?: string; linkLabel?: string };
	let { title, href, linkLabel = 'Se alle' }: Props = $props();
</script>

<div class="mb-5 flex items-end justify-between gap-4">
	<h2 class="text-xl font-normal md:text-2xl">{title}</h2>
	{#if href}
		<a
			{href}
			class="group inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
		>
			{linkLabel}
			<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
		</a>
	{/if}
</div>
