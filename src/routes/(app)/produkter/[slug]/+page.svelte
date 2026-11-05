<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatPrice } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Package from '@lucide/svelte/icons/package';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const p = $derived(data.product);
	const canOrder = $derived(data.modules.includes('cart') && !!data.user.municipalityId);
</script>

<svelte:head><title>{p.name} · Produkter</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<Button href="/produkter" variant="ghost" size="sm" class="-ml-2"
			><ArrowLeft /> Alle produkter</Button
		>
		{#if data.user.isAdmin}
			<Button href="/admin/produkter/{p.id}" variant="outline" size="sm"><Pencil /> Rediger</Button>
		{/if}
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_340px]">
		<div class="space-y-6">
			<div class="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
				{#if p.imageUrl}
					<img src={p.imageUrl} alt="" class="size-full object-cover" />
				{:else}
					<div
						class="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
					>
						<Package class="size-16 text-primary/50" />
					</div>
				{/if}
			</div>
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2">
					{#if data.category}
						<a href="/produkter?kategori={data.category.slug}"
							><Badge variant="outline">{data.category.name}</Badge></a
						>
					{/if}
					{#if p.isNew}<Badge>Nyhet</Badge>{/if}
					{#if !p.active}<Badge variant="destructive">Skjult</Badge>{/if}
				</div>
				<h1 class="text-3xl font-semibold tracking-tight">{p.name}</h1>
				<p class="text-lg text-muted-foreground">{p.summary}</p>
			</div>
			<div class="leading-7 whitespace-pre-line">{p.description}</div>
		</div>

		<aside>
			<Card.Root class="sticky top-20">
				<Card.Header>
					<Card.Description>Pris</Card.Description>
					<Card.Title class="text-2xl">{formatPrice(p.priceNok, p.priceUnit)}</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if canOrder}
						<form
							method="post"
							action="/produkter?/addToCart"
							class="flex gap-2"
							use:enhance={withToast('Lagt til i handlelisten', { reset: false })}
						>
							<input type="hidden" name="productId" value={p.id} />
							<Input
								type="number"
								name="quantity"
								value="1"
								min="1"
								max="999"
								class="w-20"
								aria-label="Antall"
							/>
							<Button type="submit" class="flex-1"><Plus /> Legg i handlelisten</Button>
						</form>
						{#if data.inCartQuantity}
							<Button href="/handleliste" variant="secondary" class="w-full">
								<ShoppingCart />
								{data.inCartQuantity} i handlelisten
							</Button>
						{/if}
					{:else if !data.user.municipalityId}
						<p class="text-sm text-muted-foreground">
							Brukeren din er ikke knyttet til en kommune, så du kan ikke bestille.
						</p>
					{/if}
					<p class="text-xs text-muted-foreground">
						Handlelisten deles med kollegaer i kommunen. Send den som forespørsel når dere er klare,
						så tar vi kontakt.
					</p>
				</Card.Content>
			</Card.Root>
		</aside>
	</div>
</div>
