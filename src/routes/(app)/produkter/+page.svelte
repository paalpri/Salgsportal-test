<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ProductCard from '#lib/components/app/product-card.svelte';
	import SectionHeader from '#lib/components/app/section-header.svelte';
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

	const orderSteps = [
		{ title: 'Bestilling', who: 'Kommunen', text: 'Kommunen sender bestilling i Toolkit.' },
		{
			title: 'Behovsavklaring',
			who: 'Kommunen og Netcompany',
			text: 'Netcompany avklarer eventuelle behov på e-post eller i et møte.'
		},
		{
			title: 'Tilbud',
			who: 'Netcompany',
			text: 'Netcompany sender et uforpliktende tilbud på e-post.'
		},
		{
			title: 'Avtale og signering',
			who: 'Kommunen og Netcompany',
			text: 'Kommunen og Netcompany signerer avtalen digitalt.'
		},
		{ title: 'Oppstart', who: 'Netcompany', text: 'Netcompany inviterer til oppstartsmøte.' },
		{
			title: 'Etablering',
			who: 'Netcompany',
			text: 'Tjenesten etableres, og Netcompany følger opp til den er klar til bruk.'
		}
	];
</script>

<svelte:head><title>Moduler og tjenester · Modulus Barn</title></svelte:head>

<PageHeader
	title="Moduler og tjenester"
	description="Rådgivning, kurs, arbeidsmøter, integrasjoner og migrering fra Netcompany, med priser. Alle tjenester bestilles i Toolkit."
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

<section id="bestilling" class="mt-14 scroll-mt-24">
	<SectionHeader title="Slik bestiller dere" />
	<p class="mb-5 max-w-3xl text-muted-foreground">
		Netcompany følger dere fra bestilling til tjenesten er etablert og klar til bruk. I Toolkit
		velger dere «Service Request» under Case type og tjenesten under Service, velger Category og Sub
		Category, fyller ut feltene med stjerne og klikker Save. Dere får bekreftelse på e-post, og
		saken følges opp i Toolkit og på e-post.
	</p>
	<ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each orderSteps as step, i (step.title)}
			<li class="space-y-1 rounded-lg bg-card p-5">
				<span
					class="mb-2 inline-flex size-7 items-center justify-center rounded-sm bg-coral text-sm font-semibold text-ink"
					>{i + 1}</span
				>
				<h3 class="font-medium">{step.title}</h3>
				<p class="text-sm text-muted-foreground">{step.text}</p>
				<p class="pt-2 text-xs tracking-wide text-muted-foreground uppercase">{step.who}</p>
			</li>
		{/each}
	</ol>
</section>
