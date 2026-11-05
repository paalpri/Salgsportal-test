<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { quoteStatuses, type QuoteStatus } from '#lib/quote-status.ts';
	import { formatDate, formatPrice } from '#lib/format.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Mail from '@lucide/svelte/icons/mail';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const r = $derived(data.request);
	// svelte-ignore state_referenced_locally
	let status = $state<QuoteStatus>(data.request.status);
	const total = $derived(
		data.items.reduce((sum, i) => sum + (i.unitPriceNok ?? 0) * i.quantity, 0)
	);
</script>

<svelte:head><title>Forespørsel #{r.id} · Admin</title></svelte:head>

<Button href="/admin/foresporsler" variant="ghost" size="sm" class="mb-2 -ml-2"
	><ArrowLeft /> Alle forespørsler</Button
>
<PageHeader
	title="Forespørsel #{r.id} · {data.municipality.name}"
	description="Sendt {formatDate(r.createdAt)}"
>
	{#snippet actions()}
		<Badge variant={quoteStatuses[r.status].variant}>{quoteStatuses[r.status].label}</Badge>
	{/snippet}
</PageHeader>

<div class="grid gap-6 lg:grid-cols-[1fr_320px]">
	<div class="space-y-6">
		<div class="overflow-hidden rounded-xl border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Produkt</Table.Head>
						<Table.Head class="text-right">Antall</Table.Head>
						<Table.Head class="text-right">Pris</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item (item.id)}
						<Table.Row>
							<Table.Cell class="whitespace-normal">
								{#if item.productId}<a
										href="/admin/produkter/{item.productId}"
										class="font-medium hover:underline">{item.productName}</a
									>
								{:else}<span class="font-medium">{item.productName}</span>{/if}
								{#if item.note}<p class="text-xs text-muted-foreground">{item.note}</p>{/if}
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{item.quantity}</Table.Cell>
							<Table.Cell class="text-right"
								>{formatPrice(item.unitPriceNok, item.priceUnit)}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.Cell colspan={2}>Estimert sum</Table.Cell>
						<Table.Cell class="text-right font-semibold">{formatPrice(total)}</Table.Cell>
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>
		{#if r.message}
			<Card.Root>
				<Card.Header><Card.Description>Melding fra kommunen</Card.Description></Card.Header>
				<Card.Content class="whitespace-pre-line">{r.message}</Card.Content>
			</Card.Root>
		{/if}
	</div>

	<div class="space-y-6">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Kontakt</Card.Title></Card.Header>
			<Card.Content class="space-y-1 text-sm">
				{#if data.submittedBy?.name}
					<p class="font-medium">{data.submittedBy.name}</p>
					{#if data.submittedBy.jobTitle}<p class="text-muted-foreground">
							{data.submittedBy.jobTitle}
						</p>{/if}
					<a
						href="mailto:{data.submittedBy.email}"
						class="inline-flex items-center gap-1 text-primary hover:underline"
						><Mail class="size-3.5" /> {data.submittedBy.email}</a
					>
				{:else}
					<p class="text-muted-foreground">Brukeren er slettet.</p>
				{/if}
				<p class="pt-2 text-muted-foreground">
					{data.municipality.name}{data.municipality.county ? `, ${data.municipality.county}` : ''}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Behandling</Card.Title>
				<Card.Description>Svaret vises for kommunen i handlelisten.</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="post" use:enhance={withToast('Lagret', { reset: false })}>
					<Field.Group>
						<Field.Field>
							<Field.Label for="status">Status</Field.Label>
							<Select.Root type="single" name="status" bind:value={status}>
								<Select.Trigger id="status" class="w-full"
									>{quoteStatuses[status].label}</Select.Trigger
								>
								<Select.Content>
									{#each Object.entries(quoteStatuses) as [key, s] (key)}
										<Select.Item value={key} label={s.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.Label for="adminNote">Svar til kommunen</Field.Label>
							<Textarea id="adminNote" name="adminNote" rows={4} value={r.adminNote} />
						</Field.Field>
						<Button type="submit">Lagre</Button>
					</Field.Group>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
</div>
