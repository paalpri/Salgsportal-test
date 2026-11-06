<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatPrice } from '#lib/format.ts';
	import { Button } from '#lib/components/ui/button/index.js';
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

<article class="card-link group flex flex-col overflow-hidden rounded-lg bg-card">
	{#if product.imageUrl}
		<a
			href="/produkter/{product.slug}"
			class="block aspect-[16/9] overflow-hidden bg-muted"
			tabindex="-1"
		>
			<img src={product.imageUrl} alt="" class="size-full object-cover" />
		</a>
	{/if}
	<div class="flex flex-1 flex-col gap-2 p-6">
		<div class="mb-2 flex min-h-6 items-start justify-between gap-3">
			{#if !product.imageUrl}<Package class="size-8" strokeWidth={1.5} />{/if}
			{#if product.isNew}
				<span class="ml-auto rounded-sm bg-coral px-2 py-0.5 text-xs font-semibold text-ink"
					>Nyhet</span
				>
			{/if}
		</div>
		{#if product.categoryName}
			<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{product.categoryName}
			</p>
		{/if}
		<h3 class="text-lg leading-snug font-medium">
			<a href="/produkter/{product.slug}" class="underline-offset-4 hover:underline"
				>{product.name}</a
			>
		</h3>
		<p class="line-clamp-2 text-sm text-muted-foreground">{product.summary}</p>
		<div class="mt-auto flex items-center justify-between gap-3 pt-4">
			<span class="text-sm font-semibold">{formatPrice(product.priceNok, product.priceUnit)}</span>
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
		</div>
	</div>
</article>
