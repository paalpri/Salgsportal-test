<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import InlineEditor from '#lib/components/app/inline-editor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Forumkategorier · Admin</title></svelte:head>

<PageHeader
	title="Forumkategorier"
	description="Kategoriene kommunene kan poste i. Moderering av tråder gjøres direkte i forumet."
/>

<InlineEditor
	addLabel="Ny kategori"
	rows={data.categories}
	fields={[
		{ name: 'name', label: 'Navn', required: true },
		{ name: 'description', label: 'Beskrivelse' },
		{ name: 'sortOrder', label: 'Rekkefølge', type: 'number', class: 'sm:max-w-28' }
	]}
	note={(row) => `${row.threads} tråder`}
	deleteDescription={(row) => `Alle ${row.threads} tråder i kategorien slettes også.`}
/>
