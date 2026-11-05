<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
</script>

<svelte:head><title>Min profil · Kommuneportalen</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<PageHeader title="Min profil" />

	<Card.Root>
		<Card.Header>
			<Card.Title>Personalia</Card.Title>
			<Card.Description>Vises ved innleggene dine i forumet.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="post"
				action="?/profile"
				use:enhance={withToast('Profilen er oppdatert', { reset: false })}
			>
				<Field.Group>
					<Field.Field data-invalid={!!errors.name}>
						<Field.Label for="name">Navn</Field.Label>
						<Input id="name" name="name" value={data.user.name} required />
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="jobTitle">Stilling</Field.Label>
						<Input id="jobTitle" name="jobTitle" value={data.user.jobTitle ?? ''} />
					</Field.Field>
					<Field.Field>
						<Field.Label>E-post</Field.Label>
						<Input value={data.user.email} disabled />
					</Field.Field>
					<Field.Field>
						<Field.Label>Kommune</Field.Label>
						<Input value={data.user.municipalityName ?? '–'} disabled />
						<Field.Description>Kontakt en administrator for å endre kommune.</Field.Description>
					</Field.Field>
					<div class="flex justify-end"><Button type="submit">Lagre</Button></div>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Endre passord</Card.Title>
			<Card.Description>Du blir logget ut av andre enheter.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="post" action="?/password" use:enhance={withToast('Passordet er endret')}>
				<Field.Group>
					<Field.Field data-invalid={!!errors.currentPassword}>
						<Field.Label for="currentPassword">Nåværende passord</Field.Label>
						<Input
							id="currentPassword"
							name="currentPassword"
							type="password"
							autocomplete="current-password"
							required
						/>
						{#if errors.currentPassword}<Field.Error>{errors.currentPassword}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.newPassword}>
						<Field.Label for="newPassword">Nytt passord</Field.Label>
						<Input
							id="newPassword"
							name="newPassword"
							type="password"
							autocomplete="new-password"
							minlength={8}
							required
						/>
						{#if errors.newPassword}<Field.Error>{errors.newPassword}</Field.Error>{/if}
					</Field.Field>
					<div class="flex justify-end"><Button type="submit">Endre passord</Button></div>
				</Field.Group>
			</form>
		</Card.Content>
	</Card.Root>
</div>
