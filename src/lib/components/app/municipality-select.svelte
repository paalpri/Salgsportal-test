<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';

	type Props = {
		municipalities: { id: number; name: string }[];
		value?: string;
		id?: string;
		name?: string;
		noneLabel?: string;
	};
	let {
		municipalities,
		value = $bindable(''),
		id,
		name = 'municipalityId',
		noneLabel
	}: Props = $props();
	const selected = $derived(municipalities.find((m) => String(m.id) === value));
</script>

<Select.Root type="single" {name} bind:value>
	<Select.Trigger {id} class="w-full"
		>{selected?.name ?? noneLabel ?? 'Velg kommune'}</Select.Trigger
	>
	<Select.Content>
		{#if noneLabel}<Select.Item value="" label={noneLabel} />{/if}
		{#each municipalities as m (m.id)}
			<Select.Item value={String(m.id)} label={m.name} />
		{/each}
	</Select.Content>
</Select.Root>
