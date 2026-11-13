<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import WelcomeHero from '#lib/components/app/welcome-hero.svelte';
	import SectionHeader from '#lib/components/app/section-header.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import PostCard from '#lib/components/app/post-card.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Hjem · Modulus Barn</title></svelte:head>

<div class="space-y-12 md:space-y-16">
	<WelcomeHero
		welcome={data.welcome}
		editHref={data.user?.isAdmin ? '/admin/forside' : undefined}
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
				<Button href="/nyheter/{c.slug}" size="lg" variant="ghost" class="h-11 px-4">Les mer</Button
				>
			</div>
		</section>
	{/if}

	{#if data.updates.length}
		<section>
			<SectionHeader title="Nytt i Modulus Barn" href="/nyheter" linkLabel="Alle nyheter" />
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.updates as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>
		</section>
	{/if}

	<section
		class="flex flex-col gap-5 rounded-lg bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8"
	>
		<div class="flex max-w-2xl gap-5">
			<Lightbulb class="size-8 shrink-0" strokeWidth={1.5} />
			<div class="space-y-2">
				<h2 class="text-xl font-normal md:text-2xl">Dere former Modulus Barn</h2>
				<p class="text-muted-foreground">
					Kommunene bestemmer i fellesskap hvordan løsningen skal utvikles videre. Har dere et ønske
					eller en idé? Legg det på ønskelisten, så tar vi det med når kommunene prioriterer.
				</p>
			</div>
		</div>
		<Button href="/onsker#nytt-onske" size="lg" class="h-11 shrink-0 px-4">Send et ønske</Button>
	</section>

	{#if data.products.length}
		<section>
			<SectionHeader title="Nye moduler og tjenester" href="/produkter" linkLabel="Se alt" />
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.products as product (product.id)}
					<ProductCard {product} />
				{/each}
			</div>
		</section>
	{/if}
</div>
