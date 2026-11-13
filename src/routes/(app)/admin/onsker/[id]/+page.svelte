<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatDate } from '#lib/format.ts';
	import { wishStatuses, wishStatusKeys, type WishStatus } from '#lib/wish-status.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import WishStatusTag from '#lib/components/app/wish-status-tag.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const w = $derived(data.wish);
	// svelte-ignore state_referenced_locally
	let status = $state<WishStatus>(data.wish.status);
	// svelte-ignore state_referenced_locally
	let categoryId = $state(data.wish.categoryId ? String(data.wish.categoryId) : '');
	const category = $derived(data.categories.find((c) => String(c.id) === categoryId));
</script>

<svelte:head><title>{w.title} · Ønsker · Admin</title></svelte:head>

<Button href="/admin/onsker" variant="ghost" size="sm" class="mb-2 -ml-2"
	><ArrowLeft /> Alle ønsker</Button
>
<PageHeader
	title={w.title}
	description="Sendt {formatDate(w.createdAt)}{data.municipalityName
		? ` fra ${data.municipalityName} kommune`
		: ''}"
>
	{#snippet actions()}
		<WishStatusTag status={w.status} />
	{/snippet}
</PageHeader>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
	<Card.Root class="h-fit">
		<Card.Header><Card.Description>Beskrivelse</Card.Description></Card.Header>
		<Card.Content class="leading-relaxed whitespace-pre-line">{w.description}</Card.Content>
	</Card.Root>

	<Card.Root class="h-fit">
		<Card.Header>
			<Card.Title class="text-base">Behandling</Card.Title>
			<Card.Description>Status og notat ser bare administratorer.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="post" action="?/save" use:enhance={withToast('Lagret', { reset: false })}>
				<Field.Group>
					<Field.Field>
						<Field.Label for="status">Status</Field.Label>
						<Select.Root type="single" name="status" bind:value={status}>
							<Select.Trigger id="status" class="w-full"
								>{wishStatuses[status].label}</Select.Trigger
							>
							<Select.Content>
								{#each wishStatusKeys as key (key)}
									<Select.Item value={key} label={wishStatuses[key].label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label for="category">Kategori</Field.Label>
						<Select.Root type="single" name="categoryId" bind:value={categoryId}>
							<Select.Trigger id="category" class="w-full"
								>{category?.name ?? 'Uten kategori'}</Select.Trigger
							>
							<Select.Content>
								<Select.Item value="" label="Uten kategori" />
								{#each data.categories as c (c.id)}
									<Select.Item value={String(c.id)} label={c.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label for="adminNote">Notat</Field.Label>
						<Textarea id="adminNote" name="adminNote" class="min-h-28" value={w.adminNote} />
					</Field.Field>
					<Button type="submit">Lagre</Button>
				</Field.Group>
			</form>
			<div class="mt-4 border-t pt-4">
				<ConfirmDelete action="?/delete" title="Slette ønsket?" success="Ønsket er slettet" />
			</div>
		</Card.Content>
	</Card.Root>
</div>
