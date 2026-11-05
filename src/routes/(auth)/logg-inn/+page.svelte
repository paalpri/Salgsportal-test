<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let pending = $state(false);
</script>

<svelte:head><title>Logg inn · Kommuneportalen</title></svelte:head>

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
	<Field.Group>
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight">Logg inn</h1>
			<p class="text-sm text-muted-foreground">Bruk e-postadressen din fra kommunen.</p>
		</div>
		{#if form?.message}
			<Alert.Root variant="destructive">
				<CircleAlert />
				<Alert.Title>{form.message}</Alert.Title>
			</Alert.Root>
		{/if}
		<Field.Field>
			<Field.Label for="email">E-post</Field.Label>
			<Input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.email ?? ''}
				required
			/>
		</Field.Field>
		<Field.Field>
			<Field.Label for="password">Passord</Field.Label>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</Field.Field>
		<Button type="submit" class="w-full" disabled={pending}>
			{pending ? 'Logger inn …' : 'Logg inn'}
		</Button>
		<Field.Description class="text-center">
			Ny bruker? <a href="/registrer{page.url.search}" class="underline underline-offset-4"
				>Opprett konto</a
			>
		</Field.Description>
	</Field.Group>
</form>
