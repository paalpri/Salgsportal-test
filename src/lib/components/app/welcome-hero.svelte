<script lang="ts">
	import type { Welcome } from '#lib/site-content.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Pencil from '@lucide/svelte/icons/pencil';

	type Props = { welcome: Welcome; editHref?: string };
	let { welcome, editHref }: Props = $props();
	const figures = $derived((welcome.figures ?? []).filter((f) => f.value.trim()));
</script>

<section class="relative overflow-hidden rounded-lg bg-brand text-brand-foreground">
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:25%_100%]"
	></div>
	<div
		class={[
			'relative grid gap-8 p-8 md:p-12',
			welcome.imageUrl && 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center'
		]}
	>
		<div class="max-w-2xl space-y-6">
			<div class="space-y-4">
				{#if welcome.eyebrow}
					<p class="text-sm text-white/70">{welcome.eyebrow}</p>
				{/if}
				<h1 class="text-4xl leading-[1.05] font-normal md:text-5xl">{welcome.title}</h1>
				{#if welcome.body}
					<p class="text-lg leading-relaxed whitespace-pre-line text-white/80">{welcome.body}</p>
				{/if}
			</div>
			{#if (welcome.primaryLabel && welcome.primaryUrl) || (welcome.secondaryLabel && welcome.secondaryUrl)}
				<div class="flex flex-wrap gap-3">
					{#if welcome.primaryLabel && welcome.primaryUrl}
						<Button
							href={welcome.primaryUrl}
							size="lg"
							class="h-11 bg-white px-4 text-ink hover:bg-coral hover:text-ink"
						>
							{welcome.primaryLabel}
							<ArrowRight />
						</Button>
					{/if}
					{#if welcome.secondaryLabel && welcome.secondaryUrl}
						<Button
							href={welcome.secondaryUrl}
							size="lg"
							variant="outline"
							class="h-11 border-white/40 bg-transparent px-4 text-white shadow-none hover:bg-white/10 hover:text-white dark:bg-transparent"
						>
							{welcome.secondaryLabel}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
		{#if welcome.imageUrl}
			<img src={welcome.imageUrl} alt="" class="aspect-[4/3] w-full rounded-md object-cover" />
		{/if}
	</div>
	{#if figures.length}
		<dl
			class="relative grid grid-cols-2 gap-px border-t border-white/15 bg-white/15 md:grid-cols-4"
		>
			{#each figures as figure, i (i)}
				<div class="flex flex-col gap-1 bg-brand px-8 py-6 md:px-12">
					<dt class="order-2 text-sm text-white/70">{figure.label}</dt>
					<dd class="text-3xl font-normal tracking-tight md:text-4xl">{figure.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}
	{#if editHref}
		<a
			href={editHref}
			class="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20"
		>
			<Pencil class="size-3.5" /> Rediger forsiden
		</a>
	{/if}
</section>
