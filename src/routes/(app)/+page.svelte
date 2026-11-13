<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import WelcomeHero from '#lib/components/app/welcome-hero.svelte';
	import KeyFigures from '#lib/components/app/key-figures.svelte';
	import { modules } from '#lib/modules.ts';
	import { site } from '#lib/site.ts';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{site.portal}</title></svelte:head>

<div class="space-y-12 md:space-y-16">
	<WelcomeHero
		welcome={data.welcome}
		editHref={data.user?.isAdmin ? '/admin/forside' : undefined}
	/>

	<nav aria-label="Hovedområder" class="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each modules as m (m.href)}
			<a href={m.href} class="card-link group flex flex-col gap-2 rounded-lg bg-card p-6">
				<m.icon class="mb-2 size-8" strokeWidth={1.5} />
				<h2 class="text-lg leading-snug font-medium">{m.title}</h2>
				<p class="text-sm text-muted-foreground">{m.description}</p>
				<span
					class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold underline-offset-4 group-hover:underline"
				>
					{m.linkLabel}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
				</span>
			</a>
		{/each}
	</nav>

	{#if data.campaign}
		{@const c = data.campaign}
		<section
			class="flex flex-col gap-5 rounded-lg bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8"
		>
			<div class="max-w-2xl space-y-2">
				<span class="inline-block rounded-sm bg-coral px-1.5 py-0.5 text-xs font-semibold text-ink"
					>Kampanje</span
				>
				<h2 class="text-xl font-normal md:text-2xl">{c.title}</h2>
				<p class="text-muted-foreground">{c.excerpt}</p>
			</div>
			<div class="flex shrink-0 flex-wrap gap-2">
				{#if c.ctaUrl}
					<Button href={c.ctaUrl} size="lg" class="h-11 px-4"
						>{c.ctaLabel ?? 'Les mer'} <ArrowRight /></Button
					>
				{/if}
				<Button href="/nyheter/{c.slug}" size="lg" variant="ghost" class="h-11 px-4">Les mer</Button
				>
			</div>
		</section>
	{/if}

	<KeyFigures figures={data.welcome.figures} />
</div>
