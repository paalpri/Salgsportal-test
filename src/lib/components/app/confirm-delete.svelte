<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant
	} from '#lib/components/ui/button/index.js';
	import Trash from '@lucide/svelte/icons/trash-2';

	type Props = {
		action: string;
		title: string;
		description?: string;
		fields?: Record<string, string | number>;
		label?: string;
		success?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
	let {
		action,
		title,
		description = 'Dette kan ikke angres.',
		fields = {},
		label = 'Slett',
		success = 'Slettet',
		variant = 'ghost',
		size = 'sm'
	}: Props = $props();
	let open = $state(false);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant, size })}>
		<Trash />
		{#if size !== 'icon' && size !== 'icon-sm'}{label}{/if}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		<form
			method="post"
			{action}
			use:enhance={withToast(success, { onSuccess: () => (open = false) })}
		>
			{#each Object.entries(fields) as [name, value] (name)}
				<input type="hidden" {name} {value} />
			{/each}
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Avbryt</AlertDialog.Cancel>
				<AlertDialog.Action type="submit" class={buttonVariants({ variant: 'destructive' })}>
					{label}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
