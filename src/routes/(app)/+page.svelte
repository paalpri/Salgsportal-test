<script lang="ts">
	import { modules } from '#lib/modules.ts';
	import { formatDate } from '#lib/format.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import WelcomeHero from '#lib/components/app/welcome-hero.svelte';
	import SectionHeader from '#lib/components/app/section-header.svelte';
	import ThreadList from '#lib/components/app/thread-list.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const firstName = $derived(data.user.name.split(' ')[0]);
	const shortcuts = $derived(modules.filter((m) => data.modules.includes(m.key)));
	const canOrder = $derived(data.modules.includes('cart') && !!data.user.municipalityId);
</script>

<svelte:head><title>Hjem · Kommuneportalen</title></svelte:head>

<div class="space-y-12 md:space-y-16">
	<WelcomeHero
		welcome={data.welcome}
		greeting="Hei, {firstName}"
		editHref={data.user.isAdmin ? '/admin/forside' : undefined}
	/>

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
				<Button href="/nyheter/{c.slug}" size="lg" variant="ghost" class="h-11 px-4"
					>Detaljer</Button
				>
			</div>
		</section>
	{/if}

	{#if shortcuts.length}
		<section>
			<SectionHeader title="I portalen" />
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each shortcuts as m (m.key)}
					<a href={m.href} class="card-link group flex flex-col gap-4 rounded-lg bg-card p-6">
						<m.icon class="size-8" strokeWidth={1.5} />
						<div class="space-y-1.5">
							<h3 class="text-lg font-medium">{m.label}</h3>
							<p class="text-sm text-muted-foreground">{m.description}</p>
						</div>
						<span class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold">
							Gå til {m.label.toLowerCase()}
							<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.threads.length || data.news.length}
		<div class="grid gap-12 lg:grid-cols-3 lg:gap-8">
			{#if data.threads.length}
				<section class={data.news.length ? 'lg:col-span-2' : 'lg:col-span-3'}>
					<SectionHeader title="Siste fra forumet" href="/forum" linkLabel="Til forumet" />
					<ThreadList threads={data.threads} />
				</section>
			{/if}
			{#if data.news.length}
				<section class={data.threads.length ? '' : 'lg:col-span-3'}>
					<SectionHeader title="Nyheter" href="/nyheter" linkLabel="Alle nyheter" />
					<ul class="divide-y overflow-hidden rounded-lg bg-card">
						{#each data.news as post (post.id)}
							<li>
								<a
									href="/nyheter/{post.slug}"
									class="group block space-y-1 px-5 py-4 hover:bg-muted md:px-6"
								>
									{#if post.publishedAt}
										<time class="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</time
										>
									{/if}
									<p class="font-medium group-hover:underline group-hover:underline-offset-4">
										{post.title}
									</p>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</div>
	{/if}

	{#if data.products.length}
		<section>
			<SectionHeader title="Nye produkter" href="/produkter" linkLabel="Se alle produkter" />
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.products as product (product.id)}
					<ProductCard {product} inCart={data.inCart.includes(product.id)} {canOrder} />
				{/each}
			</div>
		</section>
	{/if}
</div>
