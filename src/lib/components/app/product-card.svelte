<script lang="ts">
	import { formatPrice } from '#lib/format.ts';
	import OrderLink from './order-link.svelte';
	import Package from '@lucide/svelte/icons/package';

	type Props = {
		product: {
			slug: string;
			name: string;
			summary: string;
			priceNok: number | null;
			priceUnit: string | null;
			priceFrom: boolean;
			imageUrl: string | null;
			orderUrl: string | null;
			isNew: boolean;
			categoryName: string | null;
		};
	};
	let { product }: Props = $props();
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
		<p class="text-sm font-semibold">
			{formatPrice(product.priceNok, product.priceUnit, product.priceFrom)}
		</p>
		<div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
			<OrderLink url={product.orderUrl} />
			<a
				href="/produkter/{product.slug}"
				class="text-sm font-semibold underline-offset-4 hover:underline">Les mer</a
			>
		</div>
	</div>
</article>
