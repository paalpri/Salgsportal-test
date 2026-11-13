<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import DemoUserPicker from '#lib/components/app/demo-user-picker.svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let pending = $state(false);
	let submit = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (data.prefill) submit?.focus();
	});
</script>

<svelte:head><title>Logg inn · Modulus Barn</title></svelte:head>

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
			<h1 class="text-3xl font-normal">Logg inn</h1>
			<p class="text-muted-foreground">Bruk e-postadressen din fra kommunen.</p>
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
				class="h-10"
				value={data.prefill?.email ?? form?.email ?? ''}
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
				class="h-10"
				value={data.prefill?.password ?? ''}
				required
			/>
		</Field.Field>
		<Button type="submit" size="lg" class="h-11 w-full" disabled={pending} bind:ref={submit}>
			{pending ? 'Logger inn …' : 'Logg inn'}
		</Button>
		<Field.Description class="text-center">
			Ny bruker?
			<a
				href="/registrer{page.url.search}"
				class="font-medium text-foreground underline underline-offset-4"
			>
				Opprett konto
			</a>
		</Field.Description>
	</Field.Group>
</form>

{#if data.demoUsers}
	<div class="mt-10 border-t pt-8 lg:hidden">
		<DemoUserPicker users={data.demoUsers} selected={data.prefill?.key} />
	</div>
{/if}
