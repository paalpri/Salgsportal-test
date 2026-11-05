<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import MunicipalitySelect from '#lib/components/app/municipality-select.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Ban from '@lucide/svelte/icons/ban';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type Row = (typeof data.users)[number];

	const roles = { user: 'Kommunebruker', admin: 'Administrator' } as const;
	type Role = keyof typeof roles;

	let createOpen = $state(false);
	let createRole = $state<Role>('user');
	let createMunicipality = $state('');

	let editing = $state<Row | null>(null);
	let editRole = $state<Role>('user');
	let editMunicipality = $state('');

	function edit(row: Row) {
		editing = row;
		editRole = row.role === 'admin' ? 'admin' : 'user';
		editMunicipality = row.municipalityId ? String(row.municipalityId) : '';
	}
</script>

{#snippet roleSelect(id: string, value: Role, onchange: (v: Role) => void)}
	<Select.Root type="single" name="role" {value} onValueChange={(v) => onchange(v as Role)}>
		<Select.Trigger {id} class="w-full">{roles[value]}</Select.Trigger>
		<Select.Content>
			<Select.Item value="user" label={roles.user} />
			<Select.Item value="admin" label={roles.admin} />
		</Select.Content>
	</Select.Root>
{/snippet}

<svelte:head><title>Brukere · Admin</title></svelte:head>

<PageHeader title="Brukere" description="Kommunebrukere og administratorer.">
	{#snippet actions()}
		<Button onclick={() => (createOpen = true)}><Plus /> Ny bruker</Button>
	{/snippet}
</PageHeader>

<form method="get" class="relative mb-4 max-w-md" data-sveltekit-keepfocus>
	<Search
		class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
	/>
	<Input name="q" value={data.query} placeholder="Søk på navn eller e-post …" class="pl-9" />
</form>

<div class="overflow-hidden rounded-xl border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Bruker</Table.Head>
				<Table.Head class="hidden md:table-cell">Kommune</Table.Head>
				<Table.Head>Rolle</Table.Head>
				<Table.Head class="text-right"><span class="sr-only">Handlinger</span></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.users as u (u.id)}
				<Table.Row class={u.banned ? 'opacity-60' : ''}>
					<Table.Cell>
						<p class="font-medium">{u.name}</p>
						<p class="text-xs text-muted-foreground">{u.email}</p>
					</Table.Cell>
					<Table.Cell class="hidden md:table-cell">{u.municipalityName ?? '–'}</Table.Cell>
					<Table.Cell class="space-x-1">
						{#if u.role === 'admin'}<Badge>Admin</Badge>{:else}<Badge variant="outline"
								>Kommune</Badge
							>{/if}
						{#if u.banned}<Badge variant="destructive">Sperret</Badge>{/if}
					</Table.Cell>
					<Table.Cell class="text-right">
						<div class="flex justify-end gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Rediger {u.name}"
								onclick={() => edit(u)}><Pencil /></Button
							>
							{#if u.id !== data.user.id}
								<form
									method="post"
									action={u.banned ? '?/unban' : '?/ban'}
									use:enhance={withToast(
										u.banned ? 'Sperring opphevet' : 'Brukeren er sperret og logget ut'
									)}
								>
									<input type="hidden" name="userId" value={u.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon-sm"
										aria-label={u.banned ? `Opphev sperring for ${u.name}` : `Sperr ${u.name}`}
									>
										{#if u.banned}<ShieldCheck />{:else}<Ban />{/if}
									</Button>
								</form>
							{/if}
						</div>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row
					><Table.Cell colspan={4} class="py-10 text-center text-muted-foreground"
						>Ingen brukere funnet.</Table.Cell
					></Table.Row
				>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ny bruker</Dialog.Title>
			<Dialog.Description
				>Brukeren kan logge inn med e-post og passordet du setter.</Dialog.Description
			>
		</Dialog.Header>
		<form
			method="post"
			action="?/create"
			use:enhance={withToast('Brukeren er opprettet', { onSuccess: () => (createOpen = false) })}
		>
			<Field.Group>
				<Field.Field>
					<Field.Label for="c-name">Navn</Field.Label>
					<Input id="c-name" name="name" required />
				</Field.Field>
				<Field.Field>
					<Field.Label for="c-email">E-post</Field.Label>
					<Input id="c-email" name="email" type="email" required />
				</Field.Field>
				<Field.Field>
					<Field.Label for="c-password">Midlertidig passord</Field.Label>
					<Input
						id="c-password"
						name="password"
						type="text"
						minlength={8}
						required
						autocomplete="off"
					/>
				</Field.Field>
				<div class="grid gap-4 sm:grid-cols-2">
					<Field.Field>
						<Field.Label for="c-role">Rolle</Field.Label>
						{@render roleSelect('c-role', createRole, (v) => (createRole = v))}
					</Field.Field>
					<Field.Field>
						<Field.Label for="c-municipality">Kommune</Field.Label>
						<MunicipalitySelect
							id="c-municipality"
							municipalities={data.municipalities}
							bind:value={createMunicipality}
							noneLabel="Ingen kommune"
						/>
					</Field.Field>
				</div>
				<Field.Field>
					<Field.Label for="c-jobTitle">Stilling</Field.Label>
					<Input id="c-jobTitle" name="jobTitle" />
				</Field.Field>
				<Dialog.Footer>
					<Button type="button" variant="ghost" onclick={() => (createOpen = false)}>Avbryt</Button>
					<Button type="submit">Opprett</Button>
				</Dialog.Footer>
			</Field.Group>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={!!editing} onOpenChange={(open) => !open && (editing = null)}>
	<Dialog.Content>
		{#if editing}
			<Dialog.Header>
				<Dialog.Title>{editing.name}</Dialog.Title>
				<Dialog.Description>{editing.email}</Dialog.Description>
			</Dialog.Header>
			<form
				method="post"
				action="?/update"
				use:enhance={withToast('Lagret', { reset: false, onSuccess: () => (editing = null) })}
			>
				<input type="hidden" name="userId" value={editing.id} />
				<Field.Group>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="e-role">Rolle</Field.Label>
							{@render roleSelect('e-role', editRole, (v) => (editRole = v))}
							{#if editing.id === data.user.id}<Field.Description
									>Du kan ikke endre din egen rolle.</Field.Description
								>{/if}
						</Field.Field>
						<Field.Field>
							<Field.Label for="e-municipality">Kommune</Field.Label>
							<MunicipalitySelect
								id="e-municipality"
								municipalities={data.municipalities}
								bind:value={editMunicipality}
								noneLabel="Ingen kommune"
							/>
						</Field.Field>
					</div>
					<Field.Field>
						<Field.Label for="e-jobTitle">Stilling</Field.Label>
						<Input id="e-jobTitle" name="jobTitle" value={editing.jobTitle ?? ''} />
					</Field.Field>
					<Dialog.Footer>
						<Button type="button" variant="ghost" onclick={() => (editing = null)}>Avbryt</Button>
						<Button type="submit">Lagre</Button>
					</Dialog.Footer>
				</Field.Group>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
