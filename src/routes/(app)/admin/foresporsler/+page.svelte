<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { quoteStatuses } from '#lib/quote-status.ts';
	import { formatDate } from '#lib/format.ts';
	import { cn } from '#lib/utils.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const chip =
		'inline-flex items-center gap-1.5 rounded-sm bg-card px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent';
	const activeChip = 'bg-primary text-primary-foreground hover:bg-primary';
</script>

<svelte:head><title>Forespørsler · Admin</title></svelte:head>

<PageHeader title="Forespørsler" description="Handlelister kommunene har sendt inn." />

<nav class="mb-4 flex gap-2 overflow-x-auto pb-1">
	<a href="/admin/foresporsler" class={cn(chip, !data.status && activeChip)}>Alle</a>
	{#each Object.entries(quoteStatuses) as [key, s] (key)}
		<a href="?status={key}" class={cn(chip, data.status === key && activeChip)}>{s.label}</a>
	{/each}
</nav>

<div class="overflow-hidden rounded-lg bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Forespørsel</Table.Head>
				<Table.Head class="hidden md:table-cell">Sendt av</Table.Head>
				<Table.Head class="hidden sm:table-cell">Dato</Table.Head>
				<Table.Head>Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.requests as r (r.id)}
				<Table.Row>
					<Table.Cell>
						<a href="/admin/foresporsler/{r.id}" class="font-medium hover:underline"
							>#{r.id} · {r.municipalityName}</a
						>
						<span class="block text-xs text-muted-foreground">{r.itemCount} produkter</span>
					</Table.Cell>
					<Table.Cell class="hidden md:table-cell">{r.submittedBy ?? '–'}</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground sm:table-cell"
						>{formatDate(r.createdAt)}</Table.Cell
					>
					<Table.Cell
						><Badge variant={quoteStatuses[r.status].variant}>{quoteStatuses[r.status].label}</Badge
						></Table.Cell
					>
				</Table.Row>
			{:else}
				<Table.Row
					><Table.Cell colspan={4} class="py-10 text-center text-muted-foreground"
						>Ingen forespørsler.</Table.Cell
					></Table.Row
				>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
