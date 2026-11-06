<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import InlineEditor from '#lib/components/app/inline-editor.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Kategorier for ønsker · Admin</title></svelte:head>

<Button href="/admin/onsker" variant="ghost" size="sm" class="mb-2 -ml-2"
	><ArrowLeft /> Ønsker fra kommunene</Button
>
<PageHeader
	title="Kategorier for ønsker"
	description="Kommunene kan velge kategori når de sender et ønske. Beskrivelsen vises som hjelpetekst i skjemaet."
/>

<InlineEditor
	addLabel="Ny kategori"
	rows={data.categories}
	fields={[
		{ name: 'name', label: 'Navn', required: true },
		{ name: 'description', label: 'Beskrivelse' },
		{ name: 'sortOrder', label: 'Rekkefølge', type: 'number', class: 'sm:max-w-28' }
	]}
	note={(row) => `${row.wishes} ønsker`}
	deleteDescription={() => 'Ønskene i kategorien beholdes, men blir uten kategori.'}
/>
