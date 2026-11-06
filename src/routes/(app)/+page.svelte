<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import WelcomeHero from '#lib/components/app/welcome-hero.svelte';
	import SectionHeader from '#lib/components/app/section-header.svelte';
	import ThreadList from '#lib/components/app/thread-list.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import PostCard from '#lib/components/app/post-card.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const firstName = $derived(data.user.name.split(' ')[0]);
</script>

<svelte:head><title>Hjem · Modulus Barn</title></svelte:head>

<div class="space-y-12 md:space-y-16">
	<div class="space-y-4">
		{#if data.notice}
			<a
				href="/nyheter/{data.notice.slug}"
				class="group flex items-start gap-4 rounded-lg bg-card p-5 shadow-[inset_4px_0_0_var(--coral)] md:items-center md:px-6"
			>
				<TriangleAlert class="mt-0.5 size-5 shrink-0 text-coral md:mt-0" />
				<div class="min-w-0 flex-1">
					<p class="text-sm">
						<span class="font-semibold">Driftsmelding:</span>
						<span class="group-hover:underline group-hover:underline-offset-4"
							>{data.notice.title}</span
						>
					</p>
					<p class="text-sm text-muted-foreground">{data.notice.excerpt}</p>
				</div>
				<span class="hidden shrink-0 items-center gap-1.5 text-sm font-semibold md:inline-flex">
					Les mer <ArrowRight class="size-4" />
				</span>
			</a>
		{/if}

		<WelcomeHero
			welcome={data.welcome}
			greeting="Hei, {firstName}"
			editHref={data.user.isAdmin ? '/admin/forside' : undefined}
		/>
	</div>

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

	<div class="grid gap-12 lg:grid-cols-3 lg:gap-8">
		<section class="lg:col-span-2">
			<SectionHeader title="Siste fra forumet" href="/forum" linkLabel="Til forumet" />
			{#if data.threads.length}
				<ThreadList threads={data.threads} />
			{:else}
				<p class="rounded-lg bg-card p-6 text-sm text-muted-foreground">
					Ingen innlegg ennå. Bli den første!
				</p>
			{/if}
		</section>
		<aside class="flex flex-col gap-4 rounded-lg bg-card p-6 md:p-8 lg:mt-12">
			<Lightbulb class="size-8" strokeWidth={1.5} />
			<h2 class="text-xl font-normal">Dere former Modulus Barn</h2>
			<p class="text-sm text-muted-foreground">
				Kommunene bestemmer i fellesskap hvordan løsningen skal utvikles videre. Har dere et ønske
				eller en idé? Legg det på ønskelisten, så tar vi det med når kommunene prioriterer.
			</p>
			<div class="mt-auto flex flex-col gap-2 pt-2">
				<Button href="/onsker#nytt-onske" class="w-full">Send et ønske</Button>
				<Button href="/onsker" variant="ghost" class="w-full">Se mine ønsker</Button>
			</div>
		</aside>
	</div>

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
