<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import InlineEditor from '#lib/components/app/inline-editor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Kommuner · Admin</title></svelte:head>

<PageHeader
	title="Kommuner"
	description="Kommunene som bruker Modulus Barn. De kan velges når noen sender et ønske."
/>

<InlineEditor
	addLabel="Ny kommune"
	rows={data.municipalities}
	fields={[
		{ name: 'name', label: 'Navn', required: true },
		{ name: 'number', label: 'Kommunenr.', class: 'sm:max-w-28' },
		{ name: 'county', label: 'Fylke' }
	]}
	note={(row) => `${row.wishes} ønsker`}
	deleteDescription={(row) => `${row.wishes} ønsker mister koblingen til kommunen, men beholdes.`}
/>
