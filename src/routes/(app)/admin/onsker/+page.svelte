<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import WishStatusTag from '#lib/components/app/wish-status-tag.svelte';
	import { wishStatuses, wishStatusKeys } from '#lib/wish-status.ts';
	import { formatDate } from '#lib/format.ts';
	import { cn } from '#lib/utils.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Tags from '@lucide/svelte/icons/tags';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const chip =
		'inline-flex items-center gap-1.5 rounded-sm bg-card px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent';
	const activeChip = 'bg-primary text-primary-foreground hover:bg-primary';

	function filterHref(key: 'kategori' | 'status', value: string | null) {
		const rest = [...page.url.searchParams].filter(([name]) => name !== key);
		const qs = new URLSearchParams(value === null ? rest : [...rest, [key, value]]).toString();
		return qs ? `?${qs}` : '/admin/onsker';
	}
</script>

<svelte:head><title>Ønsker fra kommunene · Admin</title></svelte:head>

<PageHeader
	title="Ønsker fra kommunene"
	description="Alle ønsker som er sendt inn fra ønskelisten. Bare administratorer ser dem."
>
	{#snippet actions()}
		<Button href="/admin/onsker/kategorier" variant="outline"><Tags /> Kategorier</Button>
	{/snippet}
</PageHeader>

<div class="mb-6 space-y-3">
	<nav class="flex flex-wrap gap-2" aria-label="Kategori">
		<a href={filterHref('kategori', null)} class={cn(chip, !data.category && activeChip)}>
			Alle kategorier <span class="opacity-60">{data.total}</span>
		</a>
		{#each data.categories as c (c.id)}
			<a
				href={filterHref('kategori', String(c.id))}
				class={cn(chip, data.category === String(c.id) && activeChip)}
			>
				{c.name} <span class="opacity-60">{c.count}</span>
			</a>
		{/each}
		<a
			href={filterHref('kategori', 'ingen')}
			class={cn(chip, data.category === 'ingen' && activeChip)}
		>
			Uten kategori <span class="opacity-60">{data.uncategorized}</span>
		</a>
	</nav>
	<nav class="flex flex-wrap gap-2" aria-label="Status">
		<a href={filterHref('status', null)} class={cn(chip, !data.status && activeChip)}
			>Alle statuser</a
		>
		{#each wishStatusKeys as key (key)}
			<a href={filterHref('status', key)} class={cn(chip, data.status === key && activeChip)}>
				{wishStatuses[key].label}
			</a>
		{/each}
	</nav>
</div>

<div class="overflow-hidden rounded-lg bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Ønske</Table.Head>
				<Table.Head class="hidden md:table-cell">Kategori</Table.Head>
				<Table.Head class="hidden sm:table-cell">Dato</Table.Head>
				<Table.Head>Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.wishes as w (w.id)}
				<Table.Row>
					<Table.Cell class="whitespace-normal">
						<a href="/admin/onsker/{w.id}" class="font-medium hover:underline">{w.title}</a>
						<span class="block text-xs text-muted-foreground">
							{w.municipalityName ?? 'Kommune ikke oppgitt'}
						</span>
					</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground md:table-cell"
						>{w.categoryName ?? '–'}</Table.Cell
					>
					<Table.Cell class="hidden text-muted-foreground sm:table-cell"
						>{formatDate(w.createdAt)}</Table.Cell
					>
					<Table.Cell><WishStatusTag status={w.status} /></Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={4} class="py-10 text-center text-muted-foreground"
						>Ingen ønsker med dette filteret.</Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
