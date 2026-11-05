<script lang="ts">
	import { modules } from '#lib/modules.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import ThreadList from '#lib/components/app/thread-list.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import PostCard from '#lib/components/app/post-card.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const firstName = $derived(data.user.name.split(' ')[0]);
	const [hero, ...otherAds] = $derived(data.ads);
	const shortcuts = $derived(modules.filter((m) => data.modules.includes(m.key)));
	const canOrder = $derived(data.modules.includes('cart') && !!data.user.municipalityId);
</script>

<svelte:head><title>Hjem · Kommuneportalen</title></svelte:head>

<div class="space-y-10">
	<section class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight md:text-3xl">Hei, {firstName} 👋</h1>
		<p class="text-muted-foreground">
			{data.user.municipalityName
				? `Velkommen tilbake til portalen for ${data.user.municipalityName}.`
				: 'Velkommen tilbake.'}
		</p>
	</section>

	{#if hero}
		<section class="relative overflow-hidden rounded-2xl bg-brand p-6 text-white md:p-10">
			<div
				class="pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full bg-white/10 blur-2xl"
			></div>
			<div class="relative max-w-2xl space-y-4">
				<Badge variant="secondary" class="gap-1"><Megaphone class="size-3" /> Kampanje</Badge>
				<h2 class="text-2xl font-semibold tracking-tight md:text-3xl">{hero.title}</h2>
				<p class="text-white/85">{hero.excerpt}</p>
				<div class="flex flex-wrap gap-2">
					{#if hero.ctaUrl}
						<Button href={hero.ctaUrl} variant="secondary">
							{hero.ctaLabel ?? 'Les mer'}
							<ArrowRight />
						</Button>
					{/if}
					<Button
						href="/nyheter/{hero.slug}"
						variant="ghost"
						class="text-white hover:bg-white/10 hover:text-white"
					>
						Detaljer
					</Button>
				</div>
			</div>
		</section>
	{/if}

	<section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		{#each shortcuts as m (m.key)}
			<a
				href={m.href}
				class="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
			>
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
				>
					<m.icon class="size-5" />
				</span>
				<span class="space-y-0.5">
					<span class="block font-medium">{m.label}</span>
					<span class="block text-sm text-muted-foreground">{m.description}</span>
				</span>
			</a>
		{/each}
	</section>

	{#if data.threads.length}
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Siste fra forumet</h2>
				<Button href="/forum" variant="ghost" size="sm">Til forumet <ArrowRight /></Button>
			</div>
			<ThreadList threads={data.threads} />
		</section>
	{/if}

	{#if data.products.length}
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Nye produkter</h2>
				<Button href="/produkter" variant="ghost" size="sm">Se alle <ArrowRight /></Button>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.products as product (product.id)}
					<ProductCard {product} inCart={data.inCart.includes(product.id)} {canOrder} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.news.length || otherAds.length}
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Nyheter</h2>
				<Button href="/nyheter" variant="ghost" size="sm">Alle nyheter <ArrowRight /></Button>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each [...otherAds, ...data.news].slice(0, 3) as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>
		</section>
	{/if}
</div>
