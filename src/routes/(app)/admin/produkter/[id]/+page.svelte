<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const product = $derived(data.product);
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
	const values = $derived((form && 'values' in form ? form.values : {}) as Record<string, string>);
	const v = (key: keyof NonNullable<typeof data.product>) =>
		values[key] ?? String(product?.[key] ?? '');

	// svelte-ignore state_referenced_locally
	let categoryId = $state(data.product?.categoryId ? String(data.product.categoryId) : '');
	const category = $derived(data.categories.find((c) => String(c.id) === categoryId));
</script>

<svelte:head><title>{product ? product.name : 'Nytt produkt'} · Admin</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<Button href="/admin/produkter" variant="ghost" size="sm" class="mb-2 -ml-2"
		><ArrowLeft /> Moduler og priser</Button
	>
	<PageHeader title={product ? 'Rediger produkt' : 'Nytt produkt'}>
		{#snippet actions()}
			{#if product}
				<Button href="/produkter/{product.slug}" variant="outline" size="sm"
					><ExternalLink /> Vis</Button
				>
				<ConfirmDelete
					action="?/delete"
					title="Slette produktet?"
					description="Produktet fjernes fra katalogen og handlelister. Tidligere forespørsler beholder navn og pris."
					variant="outline"
					success="Produktet er slettet"
				/>
			{/if}
		{/snippet}
	</PageHeader>

	<form
		method="post"
		action="?/save"
		use:enhance={withToast(product ? 'Lagret' : 'Produktet er opprettet', { reset: false })}
	>
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={!!errors.name}>
						<Field.Label for="name">Navn</Field.Label>
						<Input id="name" name="name" value={v('name')} required maxlength={150} />
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="category">Kategori</Field.Label>
							<Select.Root type="single" name="categoryId" bind:value={categoryId}>
								<Select.Trigger id="category" class="w-full"
									>{category?.name ?? 'Ingen kategori'}</Select.Trigger
								>
								<Select.Content>
									<Select.Item value="" label="Ingen kategori" />
									{#each data.categories as c (c.id)}
										<Select.Item value={String(c.id)} label={c.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<Field.Field data-invalid={!!errors.slug}>
							<Field.Label for="slug">Adresse (slug)</Field.Label>
							<Input id="slug" name="slug" value={v('slug')} placeholder="Lages fra navnet" />
						</Field.Field>
					</div>
					<Field.Field data-invalid={!!errors.summary}>
						<Field.Label for="summary">Kort beskrivelse</Field.Label>
						<Textarea id="summary" name="summary" rows={2} value={v('summary')} maxlength={300} />
						{#if errors.summary}<Field.Error>{errors.summary}</Field.Error>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="description">Beskrivelse</Field.Label>
						<Textarea
							id="description"
							name="description"
							rows={8}
							class="min-h-40"
							value={v('description')}
						/>
					</Field.Field>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field data-invalid={!!errors.priceNok}>
							<Field.Label for="priceNok">Pris (NOK)</Field.Label>
							<Input
								id="priceNok"
								name="priceNok"
								type="number"
								min="0"
								step="1"
								value={v('priceNok')}
								placeholder="Tom = på forespørsel"
							/>
							{#if errors.priceNok}<Field.Error>{errors.priceNok}</Field.Error>{/if}
						</Field.Field>
						<Field.Field>
							<Field.Label for="priceUnit">Prisenhet</Field.Label>
							<Input
								id="priceUnit"
								name="priceUnit"
								value={v('priceUnit')}
								placeholder="per år, per deltaker …"
								maxlength={40}
							/>
						</Field.Field>
					</div>
					<Field.Field data-invalid={!!errors.imageUrl}>
						<Field.Label for="imageUrl">Bilde-URL</Field.Label>
						<Input id="imageUrl" name="imageUrl" value={v('imageUrl')} placeholder="https://…" />
						{#if errors.imageUrl}<Field.Error>{errors.imageUrl}</Field.Error>{/if}
					</Field.Field>
					<Field.Separator />
					<Field.Field orientation="horizontal">
						<Switch id="active" name="active" checked={product?.active ?? true} />
						<Field.Label for="active">Synlig i katalogen</Field.Label>
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Switch id="isNew" name="isNew" checked={product?.isNew ?? false} />
						<Field.Label for="isNew">Merk som nyhet</Field.Label>
					</Field.Field>
				</Field.Group>
			</Card.Content>
			<Card.Footer class="justify-end gap-2">
				<Button href="/admin/produkter" variant="ghost">Avbryt</Button>
				<Button type="submit">{product ? 'Lagre' : 'Opprett'}</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
