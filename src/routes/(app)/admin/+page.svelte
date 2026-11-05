<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import { quoteStatuses } from '#lib/quote-status.ts';
	import { formatDate } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Users from '@lucide/svelte/icons/users';
	import Landmark from '@lucide/svelte/icons/landmark';
	import MessagesSquare from '@lucide/svelte/icons/messages-square';
	import Package from '@lucide/svelte/icons/package';
	import FileText from '@lucide/svelte/icons/file-text';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Plus from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cards = $derived([
		{
			label: 'Nye forespørsler',
			value: data.stats.newRequests,
			icon: Inbox,
			href: '/admin/foresporsler?status=new'
		},
		{ label: 'Brukere', value: data.stats.users, icon: Users, href: '/admin/brukere' },
		{
			label: 'Kommuner',
			value: data.stats.municipalities,
			icon: Landmark,
			href: '/admin/kommuner'
		},
		{ label: 'Forumtråder', value: data.stats.threads, icon: MessagesSquare, href: '/forum' },
		{ label: 'Produkter', value: data.stats.products, icon: Package, href: '/admin/produkter' },
		{ label: 'Innlegg', value: data.stats.posts, icon: FileText, href: '/admin/innlegg' }
	]);
</script>

<svelte:head><title>Administrasjon · Kommuneportalen</title></svelte:head>

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
		<h2 class="text-lg font-semibold">Siste forespørsler</h2>
		<Button href="/admin/foresporsler" variant="ghost" size="sm">Se alle</Button>
	</div>
	{#if data.recent.length}
		<ul class="divide-y rounded-xl border bg-card">
			{#each data.recent as r (r.id)}
				<li>
					<a
						href="/admin/foresporsler/{r.id}"
						class="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
					>
						<span>
							<span class="font-medium">#{r.id} · {r.municipalityName}</span>
							<span class="block text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
						</span>
						<Badge variant={quoteStatuses[r.status].variant}>{quoteStatuses[r.status].label}</Badge>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-muted-foreground">Ingen forespørsler ennå.</p>
	{/if}
</section>
