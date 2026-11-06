<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import MunicipalitySelect from '#lib/components/app/municipality-select.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let pending = $state(false);
	let municipalityId = $state('');
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const values = $derived((form?.values ?? {}) as Record<string, string>);
</script>

<svelte:head><title>Opprett konto · Modulus Barn</title></svelte:head>

<form
	method="post"
	use:enhance={() => {
		pending = true;
		return async ({ update }) => {
			await update({ reset: false });
			pending = false;
		};
	}}
>
	<Field.Group class="gap-6">
		<div class="space-y-2">
			<h1 class="text-3xl font-normal">Opprett konto</h1>
			<p class="text-muted-foreground">For ansatte i kommuner som bruker Modulus Barn.</p>
		</div>
		{#if form?.message && !Object.keys(errors).length}
			<Alert.Root variant="destructive">
				<CircleAlert />
				<Alert.Title>{form.message}</Alert.Title>
			</Alert.Root>
		{/if}
		<Field.Field data-invalid={!!errors.name}>
			<Field.Label for="name">Navn</Field.Label>
			<Input id="name" name="name" autocomplete="name" value={values.name ?? ''} required />
			{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
		</Field.Field>
		<Field.Field data-invalid={!!errors.municipalityId}>
			<Field.Label for="municipality">Kommune</Field.Label>
			<MunicipalitySelect
				id="municipality"
				municipalities={data.municipalities}
				bind:value={municipalityId}
			/>
			{#if errors.municipalityId}<Field.Error>{errors.municipalityId}</Field.Error>{/if}
		</Field.Field>
		<Field.Field data-invalid={!!errors.jobTitle}>
			<Field.Label for="jobTitle"
				>Stilling <span class="text-muted-foreground">(valgfritt)</span></Field.Label
			>
			<Input
				id="jobTitle"
				name="jobTitle"
				placeholder="F.eks. barnevernleder"
				value={values.jobTitle ?? ''}
			/>
		</Field.Field>
		<Field.Field data-invalid={!!errors.email}>
			<Field.Label for="email">E-post</Field.Label>
			<Input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				value={values.email ?? ''}
				required
			/>
			{#if errors.email}<Field.Error>{errors.email}</Field.Error>{/if}
		</Field.Field>
		<Field.Field data-invalid={!!errors.password}>
			<Field.Label for="password">Passord</Field.Label>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength={8}
				required
			/>
			<Field.Description>Minst 8 tegn.</Field.Description>
			{#if errors.password}<Field.Error>{errors.password}</Field.Error>{/if}
		</Field.Field>
		<Button type="submit" size="lg" class="h-11 w-full" disabled={pending}>
			{pending ? 'Oppretter …' : 'Opprett konto'}
		</Button>
		<Field.Description class="text-center">
			Har du allerede konto? <a
				href="/logg-inn{page.url.search}"
				class="font-medium text-foreground underline underline-offset-4">Logg inn</a
			>
		</Field.Description>
	</Field.Group>
</form>
