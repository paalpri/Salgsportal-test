<script lang="ts">
	import { formatPrice } from '#lib/format.ts';
	import OrderLink from '#lib/components/app/order-link.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const p = $derived(data.product);
</script>

<svelte:head><title>{p.name} · Modulus Barn</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<Button href="/produkter" variant="ghost" size="sm" class="-ml-2"
			><ArrowLeft /> Alle moduler og tjenester</Button
		>
		{#if data.user?.isAdmin}
			<Button href="/admin/produkter/{p.id}" variant="outline" size="sm"><Pencil /> Rediger</Button>
		{/if}
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_340px]">
		<div class="space-y-6">
			{#if p.imageUrl}
				<img src={p.imageUrl} alt="" class="aspect-[16/9] w-full rounded-lg object-cover" />
			{/if}
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2">
					{#if data.category}
						<a href="/produkter?kategori={data.category.slug}"
							><Badge variant="outline">{data.category.name}</Badge></a
						>
					{/if}
					{#if p.isNew}<Badge class="bg-coral text-ink">Nyhet</Badge>{/if}
					{#if !p.active}<Badge variant="destructive">Skjult</Badge>{/if}
				</div>
				<h1 class="text-3xl font-normal md:text-4xl">{p.name}</h1>
				<p class="text-lg text-muted-foreground">{p.summary}</p>
			</div>
			<div class="leading-7 whitespace-pre-line">{p.description}</div>
			{#if p.prices.length}
				<section class="space-y-4">
					<h2 class="text-xl font-normal md:text-2xl">Priser</h2>
					<div class="divide-y rounded-lg bg-card">
						{#each p.prices as group, i (i)}
							<div class="px-5 py-4">
								{#if group.title}
									<h3
										class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
									>
										{group.title}
									</h3>
								{/if}
								<dl>
									{#each group.rows as row, j (j)}
										<div class="flex items-baseline justify-between gap-4 py-1.5">
											<dt>{row.label}</dt>
											<dd class="max-w-[60%] shrink-0 text-right font-semibold">{row.price}</dd>
										</div>
									{/each}
								</dl>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<aside>
			<Card.Root class="sticky top-20">
				<Card.Header>
					<Card.Description>Pris</Card.Description>
					<Card.Title class="text-2xl"
						>{formatPrice(p.priceNok, p.priceUnit, p.priceFrom)}</Card.Title
					>
				</Card.Header>
				<Card.Content class="space-y-3">
					<OrderLink url={p.orderUrl} size="lg" class="h-11 w-full" />
					<p class="text-xs text-muted-foreground">
						Tjenestene bestilles i Toolkit. <a href="/produkter#bestilling" class="underline"
							>Slik bestiller dere</a
						>.
					</p>
				</Card.Content>
			</Card.Root>
		</aside>
	</div>
</div>
