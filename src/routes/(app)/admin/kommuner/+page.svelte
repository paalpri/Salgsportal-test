<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import InlineEditor from '#lib/components/app/inline-editor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Kommuner · Admin</title></svelte:head>

<PageHeader
	title="Kommuner"
	description="Kundene i portalen. Med e-postdomene satt må nye brukere registrere seg med en adresse på det domenet."
/>

<InlineEditor
	addLabel="Ny kommune"
	rows={data.municipalities}
	fields={[
		{ name: 'name', label: 'Navn', required: true },
		{ name: 'number', label: 'Kommunenr.', class: 'sm:max-w-28' },
		{ name: 'county', label: 'Fylke' },
		{ name: 'emailDomain', label: 'E-postdomene', placeholder: 'kommune.kommune.no' }
	]}
	note={(row) => `${row.users} brukere`}
	deleteDescription={(row) =>
		`${row.users} brukere mister koblingen til kommunen, og handlelisten slettes. Kommuner med forespørsler kan ikke slettes.`}
/>
