<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import MunicipalitySelect from '#lib/components/app/municipality-select.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import Lock from '@lucide/svelte/icons/lock';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let categoryId = $state('');
	let municipalityId = $state('');
	const category = $derived(data.categories.find((c) => String(c.id) === categoryId));
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
</script>

<svelte:head><title>Ønskeliste · Modulus Barn</title></svelte:head>

<PageHeader
	title="Ønskeliste"
	description="Fortell oss hva dere ønsker at Modulus Barn skal kunne. Ønskene samles og tas med når kommunene prioriterer videreutviklingen sammen."
/>

<Card.Root id="nytt-onske" class="max-w-2xl scroll-mt-24">
	<Card.Header>
		<Card.Title class="text-lg font-normal">Nytt ønske</Card.Title>
		<Card.Description class="flex items-start gap-2">
			<Lock class="mt-0.5 size-3.5 shrink-0" />
			Bare Netcompany ser ønskene som sendes inn.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="post"
			action="?/create"
			use:enhance={withToast('Takk! Ønsket er sendt', {
				onSuccess: () => {
					categoryId = '';
					municipalityId = '';
				}
			})}
		>
			<Field.Group>
				<Field.Field data-invalid={!!errors.title}>
					<Field.Label for="title">Hva ønsker dere?</Field.Label>
					<Input
						id="title"
						name="title"
						maxlength={150}
						placeholder="F.eks. samlet oversikt over samværsavtaler"
						required
					/>
					{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
				</Field.Field>
				<Field.Field data-invalid={!!errors.description}>
					<Field.Label for="description">Beskrivelse</Field.Label>
					<Textarea
						id="description"
						name="description"
						class="min-h-32"
						placeholder="Hva skal løsningen gjøre, og hvorfor er det viktig for dere?"
						required
					/>
					<Field.Description
						>Ikke skriv personopplysninger eller detaljer fra enkeltsaker.</Field.Description
					>
					{#if errors.description}<Field.Error>{errors.description}</Field.Error>{/if}
				</Field.Field>
				<div class="grid gap-6 sm:grid-cols-2">
					<Field.Field>
						<Field.Label for="category"
							>Kategori <span class="text-muted-foreground">(valgfritt)</span></Field.Label
						>
						<Select.Root type="single" name="categoryId" bind:value={categoryId}>
							<Select.Trigger id="category" class="w-full"
								>{category?.name ?? 'Vet ikke'}</Select.Trigger
							>
							<Select.Content>
								<Select.Item value="" label="Vet ikke" />
								{#each data.categories as c (c.id)}
									<Select.Item value={String(c.id)} label={c.name} />
								{/each}
							</Select.Content>
						</Select.Root>
						{#if category?.description}<Field.Description>{category.description}</Field.Description
							>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="municipality"
							>Kommune <span class="text-muted-foreground">(valgfritt)</span></Field.Label
						>
						<MunicipalitySelect
							id="municipality"
							municipalities={data.municipalities}
							bind:value={municipalityId}
							noneLabel="Vil ikke oppgi"
						/>
					</Field.Field>
				</div>
				<Button type="submit" size="lg" class="h-11 w-full sm:w-fit sm:px-6">Send ønsket</Button>
			</Field.Group>
		</form>
	</Card.Content>
</Card.Root>
