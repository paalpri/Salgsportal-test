<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import InlineEditor from '#lib/components/app/inline-editor.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Produktkategorier · Admin</title></svelte:head>

<Button href="/admin/produkter" variant="ghost" size="sm" class="mb-2 -ml-2"
	><ArrowLeft /> Moduler og priser</Button
>
<PageHeader title="Produktkategorier" description="Brukes til å filtrere produktkatalogen." />

<InlineEditor
	addLabel="Ny kategori"
	rows={data.categories}
	fields={[
		{ name: 'name', label: 'Navn', required: true },
		{ name: 'description', label: 'Beskrivelse' },
		{ name: 'sortOrder', label: 'Rekkefølge', type: 'number', class: 'sm:max-w-28' }
	]}
	note={(row) => `${row.products} produkter`}
	deleteDescription={() => 'Produktene i kategorien beholdes, men blir uten kategori.'}
/>
