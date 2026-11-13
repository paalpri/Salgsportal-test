<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import WishStatusTag from '#lib/components/app/wish-status-tag.svelte';
	import { formatDate } from '#lib/format.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Users from '@lucide/svelte/icons/users';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Package from '@lucide/svelte/icons/package';
	import FileText from '@lucide/svelte/icons/file-text';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Plus from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cards = $derived([
		{
			label: 'Nye ønsker',
			value: data.stats.newWishes,
			icon: Lightbulb,
			href: '/admin/onsker?status=new'
		},
		{ label: 'Brukere', value: data.stats.users, icon: Users, href: '/admin/brukere' },
		{
			label: 'Kommuner',
			value: data.stats.municipalities,
			icon: Landmark,
			href: '/admin/kommuner'
		},
		{
			label: 'Moduler og tjenester',
			value: data.stats.products,
			icon: Package,
			href: '/admin/produkter'
		},
		{ label: 'Innlegg', value: data.stats.posts, icon: FileText, href: '/admin/innlegg' }
	]);
</script>

<svelte:head><title>Administrasjon · Modulus Barn</title></svelte:head>

<PageHeader title="Administrasjon" description="Oversikt over portalen.">
	{#snippet actions()}
		<Button href="/admin/innlegg/ny" variant="outline"><Plus /> Nytt innlegg</Button>
		<Button href="/admin/produkter/ny"><Plus /> Nytt produkt</Button>
	{/snippet}
</PageHeader>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each cards as c (c.label)}
		<a href={c.href} class="group">
			<Card.Root class="transition-colors group-hover:border-primary/40">
				<Card.Header>
					<Card.Description class="flex items-center gap-2"
						><c.icon class="size-4" /> {c.label}</Card.Description
					>
					<Card.Title class="text-3xl tabular-nums">{c.value}</Card.Title>
				</Card.Header>
			</Card.Root>
		</a>
	{/each}
</div>

<section class="mt-10 space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-normal md:text-2xl">Siste ønsker</h2>
		<Button href="/admin/onsker" variant="ghost" size="sm">Se alle</Button>
	</div>
	{#if data.recent.length}
		<ul class="divide-y rounded-lg bg-card">
			{#each data.recent as r (r.id)}
				<li>
					<a
						href="/admin/onsker/{r.id}"
						class="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
					>
						<span>
							<span class="font-medium">{r.title}</span>
							<span class="block text-sm text-muted-foreground"
								>{formatDate(r.createdAt)}{r.municipalityName
									? ` · ${r.municipalityName}`
									: ''}</span
							>
						</span>
						<WishStatusTag status={r.status} />
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-muted-foreground">Ingen ønsker ennå.</p>
	{/if}
</section>
