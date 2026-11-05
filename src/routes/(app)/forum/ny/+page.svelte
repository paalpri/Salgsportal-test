<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	let categoryId = $state(data.preselected);
	const selected = $derived(data.categories.find((c) => String(c.id) === categoryId));
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const values = $derived((form?.values ?? {}) as Record<string, string>);
</script>

<svelte:head><title>Nytt innlegg · Forum</title></svelte:head>

<div class="mx-auto max-w-2xl">
	<PageHeader
		title="Nytt innlegg"
		description="Beskriv spørsmålet eller erfaringen din. Ikke del personopplysninger."
	/>
	<Card.Root>
		<Card.Content>
			<form method="post" use:enhance={withToast('Innlegget er publisert', { reset: false })}>
				<Field.Group>
					<Field.Field data-invalid={!!errors.categoryId}>
						<Field.Label for="category">Kategori</Field.Label>
						<Select.Root type="single" name="categoryId" bind:value={categoryId}>
							<Select.Trigger id="category" class="w-full"
								>{selected?.name ?? 'Velg kategori'}</Select.Trigger
							>
							<Select.Content>
								{#each data.categories as c (c.id)}
									<Select.Item value={String(c.id)} label={c.name} />
								{/each}
							</Select.Content>
						</Select.Root>
						{#if errors.categoryId}<Field.Error>{errors.categoryId}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.title}>
						<Field.Label for="title">Tittel</Field.Label>
						<Input id="title" name="title" value={values.title ?? ''} maxlength={150} required />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.body}>
						<Field.Label for="body">Innhold</Field.Label>
						<Textarea
							id="body"
							name="body"
							rows={8}
							class="min-h-40"
							value={values.body ?? ''}
							required
						/>
						{#if errors.body}<Field.Error>{errors.body}</Field.Error>{/if}
					</Field.Field>
					<div class="flex justify-end gap-2">
						<Button href="/forum" variant="ghost">Avbryt</Button>
						<Button type="submit">Publiser</Button>
					</div>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</div>
