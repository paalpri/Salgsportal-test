<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import SessionForm from './session-form.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const course = $derived(data.course);
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
	const values = $derived((form && 'values' in form ? form.values : {}) as Record<string, string>);
	const v = (key: 'title' | 'description' | 'agenda' | 'audience') =>
		values[key] ?? course?.[key] ?? '';
</script>

<svelte:head><title>{course ? course.title : 'Nytt kurs'} · Admin</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div>
		<Button href="/admin/kurs" variant="ghost" size="sm" class="mb-2 -ml-2"
			><ArrowLeft /> Kurskalender</Button
		>
		<PageHeader title={course ? 'Rediger kurs' : 'Nytt kurs'}>
			{#snippet actions()}
				{#if course}
					<ConfirmDelete
						action="?/delete"
						title="Slette kurset?"
						description="Kurset og alle kursdatoene fjernes fra kurskalenderen."
						variant="outline"
						success="Kurset er slettet"
					/>
				{/if}
			{/snippet}
		</PageHeader>
	</div>

	<form
		method="post"
		action="?/save"
		use:enhance={withToast(course ? 'Lagret' : 'Kurset er opprettet', { reset: false })}
	>
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={!!errors.title}>
						<Field.Label for="title">Kurstittel</Field.Label>
						<Input id="title" name="title" value={v('title')} required maxlength={150} />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="description">Kursbeskrivelse</Field.Label>
						<Textarea id="description" name="description" rows={4} value={v('description')} />
					</Field.Field>
					<Field.Field>
						<Field.Label for="agenda">Agenda</Field.Label>
						<Textarea id="agenda" name="agenda" rows={6} value={v('agenda')} />
						<Field.Description>Ett tema per linje.</Field.Description>
					</Field.Field>
					<Field.Field data-invalid={!!errors.audience}>
						<Field.Label for="audience">Målgruppe</Field.Label>
						<Input id="audience" name="audience" value={v('audience')} maxlength={300} />
						{#if errors.audience}<Field.Error>{errors.audience}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
			<Card.Footer class="justify-end gap-2">
				<Button href="/admin/kurs" variant="ghost">Avbryt</Button>
				<Button type="submit">{course ? 'Lagre' : 'Opprett'}</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	{#if course}
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-normal md:text-2xl">Kursdatoer</h2>
				<p class="text-muted-foreground">
					Hver dato vises i kurskalenderen med sin egen påmeldingslenke. Tidene er norsk tid.
				</p>
			</div>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Legg til kursdato</Card.Title></Card.Header>
				<Card.Content><SessionForm /></Card.Content>
			</Card.Root>
			{#if data.sessions.length}
				<div class="divide-y rounded-lg bg-card">
					{#each data.sessions as session (session.id)}
						<div class="p-6"><SessionForm {session} /></div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
