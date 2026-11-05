<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { formatDate } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Pin from '@lucide/svelte/icons/pin';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Nyheter og annonser · Admin</title></svelte:head>

<PageHeader
	title="Nyheter og annonser"
	description="Kampanjer vises som banner på forsiden. Nyheter vises i nyhetsoversikten."
>
	{#snippet actions()}
		<Button href="/admin/innlegg/ny"><Plus /> Nytt innlegg</Button>
	{/snippet}
</PageHeader>

<div class="overflow-hidden rounded-xl border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Tittel</Table.Head>
				<Table.Head>Type</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="hidden md:table-cell">Sist endret</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.posts as p (p.id)}
				<Table.Row>
					<Table.Cell class="whitespace-normal">
						<a
							href="/admin/innlegg/{p.id}"
							class="inline-flex items-center gap-1.5 font-medium hover:underline"
						>
							{#if p.pinned}<Pin class="size-3.5 text-primary" />{/if}{p.title}
						</a>
					</Table.Cell>
					<Table.Cell
						><Badge variant="outline">{p.kind === 'ad' ? 'Kampanje' : 'Nyhet'}</Badge></Table.Cell
					>
					<Table.Cell>
						{#if p.published}<Badge variant="secondary">Publisert</Badge>{:else}<Badge
								variant="outline">Utkast</Badge
							>{/if}
					</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground md:table-cell"
						>{formatDate(p.updatedAt)}</Table.Cell
					>
				</Table.Row>
			{:else}
				<Table.Row
					><Table.Cell colspan={4} class="py-10 text-center text-muted-foreground"
						>Ingen innlegg ennå.</Table.Cell
					></Table.Row
				>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
