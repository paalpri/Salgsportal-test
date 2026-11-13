<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { formatDate } from '#lib/format.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import WishStatusTag from '#lib/components/app/wish-status-tag.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Lock from '@lucide/svelte/icons/lock';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let categoryId = $state('');
	const category = $derived(data.categories.find((c) => String(c.id) === categoryId));
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
</script>

<svelte:head><title>Ønskeliste · Modulus Barn</title></svelte:head>

<PageHeader
	title="Ønskeliste"
	description="Fortell oss hva dere ønsker at Modulus Barn skal kunne. Ønskene samles og tas med når kommunene prioriterer videreutviklingen sammen."
/>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
	<section>
		<h2 class="mb-5 text-xl font-normal md:text-2xl">Mine ønsker</h2>
		{#if data.wishes.length}
			<ul class="space-y-3">
				{#each data.wishes as w (w.id)}
					<li class="rounded-lg bg-card p-5 md:p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 space-y-1">
								<h3 class="text-lg leading-snug font-medium">{w.title}</h3>
								<p class="text-sm text-muted-foreground">
									{formatDate(w.createdAt)}{w.categoryName ? ` · ${w.categoryName}` : ''}
								</p>
							</div>
							<WishStatusTag status={w.status} />
						</div>
						<p class="mt-3 text-sm leading-relaxed whitespace-pre-line">{w.description}</p>
						{#if w.adminNote}
							<p class="mt-4 rounded-sm bg-muted px-4 py-3 text-sm">
								<span class="font-medium">Svar fra Netcompany:</span>
								{w.adminNote}
							</p>
						{/if}
						{#if w.status === 'new'}
							<div class="mt-3 -ml-2">
								<ConfirmDelete
									action="?/withdraw"
									title="Trekke tilbake ønsket?"
									description="Ønsket slettes. Du kan sende et nytt når som helst."
									fields={{ id: w.id }}
									label="Trekk tilbake"
									success="Ønsket er trukket tilbake"
								/>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<Empty.Root class="rounded-lg bg-card">
				<Empty.Header>
					<Empty.Media variant="icon"><Lightbulb /></Empty.Media>
					<Empty.Title>Ingen ønsker ennå</Empty.Title>
					<Empty.Description
						>Når du sender et ønske, ser du det her sammen med status og svar.</Empty.Description
					>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</section>

	<Card.Root id="nytt-onske" class="h-fit scroll-mt-24 lg:sticky lg:top-24">
		<Card.Header>
			<Card.Title class="text-lg font-normal">Nytt ønske</Card.Title>
			<Card.Description class="flex items-start gap-2">
				<Lock class="mt-0.5 size-3.5 shrink-0" />
				Bare du og Netcompany ser ønskene dine.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="post"
				action="?/create"
				use:enhance={withToast('Takk! Ønsket er sendt', { onSuccess: () => (categoryId = '') })}
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
					<Button type="submit" size="lg" class="h-11 w-full">Send ønsket</Button>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</div>
