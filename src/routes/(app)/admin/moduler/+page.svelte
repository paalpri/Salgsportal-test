<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { modules } from '#lib/modules.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import Info from '@lucide/svelte/icons/info';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let form: HTMLFormElement;
	let pending = $state({ key: '', enabled: false });

	async function toggle(key: string, enabled: boolean) {
		pending = { key, enabled };
		await tick();
		form.requestSubmit();
	}
</script>

<svelte:head><title>Moduler · Admin</title></svelte:head>

<PageHeader
	title="Moduler"
	description="Slå deler av portalen av eller på for alle kommunebrukere."
/>

<form
	method="post"
	bind:this={form}
	class="hidden"
	use:enhance={withToast('Lagret', { reset: false })}
>
	<input type="hidden" name="key" value={pending.key} />
	<input type="hidden" name="enabled" value={pending.enabled ? 'on' : 'off'} />
</form>

<div class="divide-y rounded-lg bg-card">
	{#each modules as m (m.key)}
		<div class="flex items-center gap-4 p-4">
			<span
				class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
			>
				<m.icon class="size-5" />
			</span>
			<label for="module-{m.key}" class="flex-1 space-y-0.5">
				<span class="block font-medium">{m.label}</span>
				<span class="block text-sm text-muted-foreground">{m.description}</span>
			</label>
			<Switch
				id="module-{m.key}"
				checked={data.modules.includes(m.key)}
				onCheckedChange={(v) => toggle(m.key, v)}
			/>
		</div>
	{/each}
</div>

<Alert.Root class="mt-6">
	<Info />
	<Alert.Title>Legge til en ny modul?</Alert.Title>
	<Alert.Description>
		Nye moduler registreres i <code>src/lib/modules.ts</code> med egen rutemappe. De dukker da opp i menyen
		og her automatisk.
	</Alert.Description>
</Alert.Root>
