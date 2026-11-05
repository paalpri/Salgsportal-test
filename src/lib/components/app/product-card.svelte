<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatPrice } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Package from '@lucide/svelte/icons/package';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';

	type Props = {
		product: {
			id: number;
			slug: string;
			name: string;
			summary: string;
			priceNok: number | null;
			priceUnit: string | null;
			imageUrl: string | null;
			isNew: boolean;
			categoryName: string | null;
		};
		inCart?: boolean;
		canOrder?: boolean;
	};
	let { product, inCart = false, canOrder = true }: Props = $props();
</script>

<Card.Root class="group flex flex-col overflow-hidden pt-0">
	<a href="/produkter/{product.slug}" class="relative block aspect-[16/9] overflow-hidden bg-muted">
		{#if product.imageUrl}
			<img
				src={product.imageUrl}
				alt=""
				class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		{:else}
			<div
				class="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
			>
				<Package class="size-10 text-primary/60" />
			</div>
		{/if}
		{#if product.isNew}<Badge class="absolute top-3 left-3">Nyhet</Badge>{/if}
	</a>
	<Card.Header>
		{#if product.categoryName}
			<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{product.categoryName}
			</p>
		{/if}
		<Card.Title
			><a href="/produkter/{product.slug}" class="hover:underline">{product.name}</a></Card.Title
		>
		<Card.Description class="line-clamp-2">{product.summary}</Card.Description>
	</Card.Header>
	<Card.Footer class="mt-auto flex items-center justify-between gap-2">
		<span class="text-sm font-medium">{formatPrice(product.priceNok, product.priceUnit)}</span>
		{#if canOrder && inCart}
			<Button href="/handleliste" size="sm" variant="secondary"><Check /> I listen</Button>
		{:else if canOrder}
			<form
				method="post"
				action="/produkter?/addToCart"
				use:enhance={withToast('Lagt til i handlelisten')}
			>
				<input type="hidden" name="productId" value={product.id} />
				<Button type="submit" size="sm"><Plus /> Legg til</Button>
			</form>
		{/if}
	</Card.Footer>
</Card.Root>
