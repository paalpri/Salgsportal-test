<script lang="ts" module>
	export type InlineField = {
		name: string;
		label: string;
		placeholder?: string;
		type?: 'text' | 'number';
		required?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import ConfirmDelete from './confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	type Row = { id: number } & Record<string, unknown>;
	type Props = {
		fields: InlineField[];
		rows: Row[];
		addLabel?: string;
		note?: (row: Row) => string | undefined;
		deleteDescription?: (row: Row) => string;
	};
	let { fields, rows, addLabel = 'Legg til', note, deleteDescription }: Props = $props();

	const grid = 'grid flex-1 gap-2 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]';
</script>

<div class="space-y-6" style="--cols: {fields.length}">
	<Card.Root>
		<Card.Header><Card.Title class="text-base">{addLabel}</Card.Title></Card.Header>
		<Card.Content>
			<form
				method="post"
				action="?/create"
				class="flex flex-col gap-2 sm:flex-row"
				use:enhance={withToast('Lagt til')}
			>
				<div class={grid}>
					{#each fields as f (f.name)}
						<Input
							name={f.name}
							type={f.type ?? 'text'}
							placeholder={f.placeholder ?? f.label}
							aria-label={f.label}
							required={f.required}
							class={f.class}
						/>
					{/each}
				</div>
				<Button type="submit"><Plus /> Legg til</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<div class="divide-y rounded-xl border bg-card">
		<div class="hidden gap-2 px-4 py-2 text-xs font-medium text-muted-foreground sm:flex">
			<div class={grid}>
				{#each fields as f (f.name)}<span>{f.label}</span>{/each}
			</div>
			<span class="w-[150px]"></span>
		</div>
		{#each rows as row (row.id)}
			<div class="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
				<form
					method="post"
					action="?/update"
					class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
					use:enhance={withToast('Lagret', { reset: false })}
				>
					<input type="hidden" name="id" value={row.id} />
					<div class={grid}>
						{#each fields as f (f.name)}
							<Input
								name={f.name}
								type={f.type ?? 'text'}
								value={String(row[f.name] ?? '')}
								placeholder={f.placeholder ?? f.label}
								aria-label={f.label}
								required={f.required}
								class={f.class}
							/>
						{/each}
					</div>
					<Button type="submit" variant="outline" size="sm">Lagre</Button>
				</form>
				<div class="flex items-center gap-2">
					{#if note?.(row)}<span class="text-xs whitespace-nowrap text-muted-foreground"
							>{note(row)}</span
						>{/if}
					<ConfirmDelete
						action="?/delete"
						title="Slette?"
						description={deleteDescription?.(row) ?? 'Dette kan ikke angres.'}
						fields={{ id: row.id }}
						size="icon-sm"
					/>
				</div>
			</div>
		{:else}
			<p class="p-6 text-center text-sm text-muted-foreground">Ingenting her ennå.</p>
		{/each}
	</div>
</div>
