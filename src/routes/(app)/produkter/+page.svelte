<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { cn } from '#lib/utils.ts';
	import Search from '@lucide/svelte/icons/search';
	import Package from '@lucide/svelte/icons/package';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const chip =
		'inline-flex items-center gap-1.5 rounded-sm bg-card px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent';
	const activeChip = 'bg-primary text-primary-foreground hover:bg-primary';
</script>

<svelte:head><title>Moduler og tjenester · Modulus Barn</title></svelte:head>

<PageHeader
	title="Moduler og tjenester"
	description="Utvid Modulus Barn med nye moduler, integrasjoner, kurs og hjelp til innføring. Hver modul lenker til der dere bestiller den."
/>

<div class="mb-6 space-y-4">
	<form method="get" class="relative max-w-md" data-sveltekit-keepfocus>
		{#if data.active}<input type="hidden" name="kategori" value={data.active.slug} />{/if}
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		/>
		<Input name="q" value={data.query} placeholder="Søk i moduler og tjenester …" class="pl-9" />
	</form>
	<nav class="flex gap-2 overflow-x-auto pb-1" aria-label="Kategorier">
		<a href="/produkter" class={cn(chip, !data.active && !data.onlyNew && activeChip)}>Alle</a>
		<a href="/produkter?nyheter" class={cn(chip, data.onlyNew && activeChip)}
			><Sparkles class="size-3.5" /> Nyheter</a
		>
		{#each data.categories as c (c.id)}
			<a
				href="/produkter?kategori={c.slug}"
				class={cn(chip, data.active?.id === c.id && activeChip)}>{c.name}</a
			>
		{/each}
	</nav>
</div>

{#if data.products.length}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.products as product (product.id)}
			<ProductCard {product} />
		{/each}
	</div>
{:else}
	<Empty.Root class="border">
		<Empty.Header>
			<Empty.Media variant="icon"><Package /></Empty.Media>
			<Empty.Title>Fant ingenting</Empty.Title>
			<Empty.Description>Prøv et annet søk eller en annen kategori.</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/if}
