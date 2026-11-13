<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { formatLongDate, osloTime } from '#lib/courses.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Kurskalender · Admin</title></svelte:head>

<PageHeader
	title="Kurskalender"
	description="Kursene i kurskalenderen. Et kurs kan holdes på flere datoer, hver med sin egen påmeldingslenke."
>
	{#snippet actions()}
		<Button href="/kurskalender" variant="outline"><CalendarDays /> Vis kalenderen</Button>
		<Button href="/admin/kurs/ny"><Plus /> Nytt kurs</Button>
	{/snippet}
</PageHeader>

<div class="overflow-hidden rounded-lg bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Kurs</Table.Head>
				<Table.Head class="hidden sm:table-cell">Neste kursdato</Table.Head>
				<Table.Head>Kommende datoer</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.courses as c (c.id)}
				<Table.Row>
					<Table.Cell class="whitespace-normal">
						<a href="/admin/kurs/{c.id}" class="font-medium hover:underline">{c.title}</a>
					</Table.Cell>
					<Table.Cell class="hidden text-muted-foreground first-letter:uppercase sm:table-cell">
						{c.next ? `${formatLongDate(c.next)} kl. ${osloTime(c.next)}` : '–'}
					</Table.Cell>
					<Table.Cell>{c.upcoming}</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row
					><Table.Cell colspan={3} class="py-10 text-center text-muted-foreground"
						>Ingen kurs ennå.</Table.Cell
					></Table.Row
				>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
