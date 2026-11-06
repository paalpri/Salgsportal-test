<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { formatPrice } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Tags from '@lucide/svelte/icons/tags';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Produkter · Admin</title></svelte:head>

<PageHeader title="Produkter" description="Produktkatalogen som kommunene ser.">
	{#snippet actions()}
		<Button href="/admin/produkter/kategorier" variant="outline"><Tags /> Kategorier</Button>
		<Button href="/admin/produkter/ny"><Plus /> Nytt produkt</Button>
	{/snippet}
</PageHeader>

<div class="overflow-hidden rounded-lg bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Navn</Table.Head>
				<Table.Head class="hidden md:table-cell">Kategori</Table.Head>
				<Table.Head class="hidden sm:table-cell">Pris</Table.Head>
				<Table.Head>Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.products as p (p.id)}
				<Table.Row>
					<Table.Cell class="whitespace-normal">
						<a href="/admin/produkter/{p.id}" class="font-medium hover:underline">{p.name}</a>
					</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground md:table-cell"
						>{p.categoryName ?? '–'}</Table.Cell
					>
					<Table.Cell class="hidden sm:table-cell"
						>{formatPrice(p.priceNok, p.priceUnit)}</Table.Cell
					>
					<Table.Cell class="space-x-1">
						{#if p.active}<Badge variant="secondary">Synlig</Badge>{:else}<Badge variant="outline"
								>Skjult</Badge
							>{/if}
						{#if p.isNew}<Badge class="bg-coral text-ink">Nyhet</Badge>{/if}
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row
					><Table.Cell colspan={4} class="py-10 text-center text-muted-foreground"
						>Ingen produkter ennå.</Table.Cell
					></Table.Row
				>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
