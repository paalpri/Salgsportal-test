<script lang="ts">
	import type { KeyFigure } from '#lib/site-content.ts';
	import SectionHeader from './section-header.svelte';

	let { figures }: { figures: KeyFigure[] } = $props();
	const shown = $derived(figures.filter((f) => f.value.trim()));
</script>

{#if shown.length}
	<section>
		<SectionHeader title="Modulus Barn i tall" />
		<div class="overflow-hidden rounded-lg bg-brand text-brand-foreground">
			<dl class="grid grid-cols-2 gap-px bg-white/15 md:grid-cols-4">
				{#each shown as figure, i (i)}
					<div class="flex flex-col gap-1 bg-brand px-6 py-5">
						<dt class="order-2 text-sm text-white/70">{figure.label}</dt>
						<dd class="text-2xl font-normal tracking-tight md:text-3xl">{figure.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>
{/if}
