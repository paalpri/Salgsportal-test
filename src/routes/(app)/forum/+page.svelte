<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ThreadList from '#lib/components/app/thread-list.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { cn } from '#lib/utils.ts';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import MessagesSquare from '@lucide/svelte/icons/messages-square';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const newHref = $derived(data.active ? `/forum/ny?kategori=${data.active.slug}` : '/forum/ny');
</script>

<svelte:head><title>Forum · Kommuneportalen</title></svelte:head>

<PageHeader title="Forum" description="Still spørsmål, del erfaringer og hjelp andre kommuner.">
	{#snippet actions()}
		<Button href={newHref}><Plus /> Nytt innlegg</Button>
	{/snippet}
</PageHeader>

<div class="grid gap-6 lg:grid-cols-[240px_1fr]">
	<nav class="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Kategorier">
		<a
			href="/forum"
			class={cn(
				'rounded-md px-3 py-2 text-sm whitespace-nowrap hover:bg-muted',
				!data.active && 'bg-muted font-medium'
			)}
		>
			Alle kategorier
		</a>
		{#each data.categories as c (c.id)}
			<a
				href="/forum?kategori={c.slug}"
				title={c.description}
				class={cn(
					'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap hover:bg-muted',
					data.active?.id === c.id && 'bg-muted font-medium'
				)}
			>
				{c.name}
				<span class="text-xs text-muted-foreground">{c.threadCount}</span>
			</a>
		{/each}
	</nav>

	<div class="space-y-4">
		<form method="get" class="relative" data-sveltekit-keepfocus>
			{#if data.active}<input type="hidden" name="kategori" value={data.active.slug} />{/if}
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input name="q" value={data.query} placeholder="Søk i forumet …" class="pl-9" />
		</form>
		{#if data.active?.description}
			<p class="text-sm text-muted-foreground">{data.active.description}</p>
		{/if}
		{#if data.threads.length}
			<ThreadList threads={data.threads} showCategory={!data.active} />
		{:else}
			<Empty.Root class="border">
				<Empty.Header>
					<Empty.Media variant="icon"><MessagesSquare /></Empty.Media>
					<Empty.Title>{data.query ? 'Ingen treff' : 'Ingen innlegg her ennå'}</Empty.Title>
					<Empty.Description>Start en ny tråd, så kan andre kommuner hjelpe til.</Empty.Description>
				</Empty.Header>
				<Empty.Content><Button href={newHref}><Plus /> Nytt innlegg</Button></Empty.Content>
			</Empty.Root>
		{/if}
	</div>
</div>
