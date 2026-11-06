<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatDate, formatPrice } from '#lib/format.ts';
	import { quoteStatuses } from '#lib/quote-status.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Send from '@lucide/svelte/icons/send';
	import Trash from '@lucide/svelte/icons/trash-2';
	import Landmark from '@lucide/svelte/icons/landmark';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const orderable = $derived(data.items.filter((i) => i.product.active));
	const total = $derived(
		orderable.reduce((sum, i) => sum + (i.product.priceNok ?? 0) * i.quantity, 0)
	);
	const hasUnpriced = $derived(orderable.some((i) => i.product.priceNok === null));
	const submitOnChange = (e: Event) => (e.currentTarget as HTMLInputElement).form?.requestSubmit();
</script>

<svelte:head><title>Handleliste · Kommuneportalen</title></svelte:head>

<PageHeader
	title="Handleliste"
	description={data.user.municipalityName
		? `Felles liste for ${data.user.municipalityName}. Alle i kommunen ser og kan endre den.`
		: undefined}
/>

{#if !data.user.municipalityId}
	<Empty.Root class="border">
		<Empty.Header>
			<Empty.Media variant="icon"><Landmark /></Empty.Media>
			<Empty.Title>Ingen kommune</Empty.Title>
			<Empty.Description
				>Brukeren din er ikke knyttet til en kommune. Ta kontakt med en administrator.</Empty.Description
			>
		</Empty.Header>
	</Empty.Root>
{:else}
	<div class="grid gap-6 lg:grid-cols-[1fr_320px]">
		<div>
			{#if data.items.length}
				<div class="overflow-hidden rounded-lg bg-card">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Produkt</Table.Head>
								<Table.Head class="w-24">Antall</Table.Head>
								<Table.Head class="hidden md:table-cell">Notat</Table.Head>
								<Table.Head class="w-10"><span class="sr-only">Fjern</span></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.items as item (item.id)}
								<Table.Row class={item.product.active ? '' : 'opacity-60'}>
									<Table.Cell class="align-top whitespace-normal">
										<a href="/produkter/{item.product.slug}" class="font-medium hover:underline"
											>{item.product.name}</a
										>
										<p class="text-xs text-muted-foreground">
											{formatPrice(item.product.priceNok, item.product.priceUnit)}
											{#if item.addedBy}· lagt til av {item.addedBy}{/if}
										</p>
										{#if !item.product.active}<p class="text-xs text-destructive">
												Ikke lenger tilgjengelig
											</p>{/if}
									</Table.Cell>
									<Table.Cell colspan={2} class="align-top">
										<form
											method="post"
											action="?/update"
											class="flex gap-2"
											use:enhance={withToast(undefined, { reset: false })}
										>
											<input type="hidden" name="id" value={item.id} />
											<Input
												type="number"
												name="quantity"
												value={item.quantity}
												min="1"
												max="999"
												class="w-20"
												aria-label="Antall"
												onchange={submitOnChange}
											/>
											<Input
												name="note"
												value={item.note}
												placeholder="Notat"
												maxlength={500}
												class="hidden md:block"
												aria-label="Notat"
												onchange={submitOnChange}
											/>
										</form>
									</Table.Cell>
									<Table.Cell class="align-top">
										<form
											method="post"
											action="?/remove"
											use:enhance={withToast('Fjernet fra listen')}
										>
											<input type="hidden" name="id" value={item.id} />
											<Button
												type="submit"
												variant="ghost"
												size="icon-sm"
												aria-label="Fjern {item.product.name}"><Trash /></Button
											>
										</form>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{:else}
				<Empty.Root class="border">
					<Empty.Header>
						<Empty.Media variant="icon"><ShoppingCart /></Empty.Media>
						<Empty.Title>Handlelisten er tom</Empty.Title>
						<Empty.Description
							>Legg til moduler, kurs eller tjenester fra produktkatalogen.</Empty.Description
						>
					</Empty.Header>
					<Empty.Content><Button href="/produkter">Se produkter</Button></Empty.Content>
				</Empty.Root>
			{/if}
		</div>

		<Card.Root class="h-fit">
			<Card.Header>
				<Card.Title>Send forespørsel</Card.Title>
				<Card.Description
					>Vi svarer med tilbud og videre fremdrift. Forespørselen er ikke bindende.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<form
					method="post"
					action="?/submit"
					class="space-y-4"
					use:enhance={withToast('Forespørselen er sendt')}
				>
					<div class="flex items-baseline justify-between">
						<span class="text-sm text-muted-foreground">Estimert sum</span>
						<span class="text-2xl font-normal tabular-nums">{formatPrice(total)}</span>
					</div>
					{#if hasUnpriced}<p class="text-xs text-muted-foreground">
							+ produkter med pris på forespørsel
						</p>{/if}
					<Textarea
						name="message"
						rows={3}
						placeholder="Melding til oss (valgfritt)"
						maxlength={2000}
					/>
					<Button type="submit" size="lg" class="h-11 w-full" disabled={!orderable.length}
						><Send /> Send forespørsel</Button
					>
				</form>
			</Card.Content>
		</Card.Root>
	</div>

	{#if data.requests.length}
		<section class="mt-12 md:mt-16">
			<h2 class="mb-5 text-xl font-normal md:text-2xl">Tidligere forespørsler</h2>
			<ul class="divide-y overflow-hidden rounded-lg bg-card">
				{#each data.requests as r (r.id)}
					<li class="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">
						<div class="space-y-1">
							<p class="font-medium">Forespørsel #{r.id} · {r.itemCount} produkter</p>
							<p class="text-sm text-muted-foreground">
								{formatDate(r.createdAt)}{r.submittedBy ? ` · ${r.submittedBy}` : ''}
							</p>
							{#if r.message}<p class="text-sm">«{r.message}»</p>{/if}
							{#if r.adminNote}
								<p class="mt-2 rounded-sm bg-muted px-3 py-2 text-sm">
									<span class="font-medium">Svar fra Netcompany:</span>
									{r.adminNote}
								</p>
							{/if}
						</div>
						<Badge variant={quoteStatuses[r.status].variant} class="w-fit"
							>{quoteStatuses[r.status].label}</Badge
						>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/if}
