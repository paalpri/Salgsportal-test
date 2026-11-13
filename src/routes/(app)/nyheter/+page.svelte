<script lang="ts">
	import { goto } from '$app/navigation';
	import { postKinds, postKindKeys } from '#lib/post-kinds.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import PostCard from '#lib/components/app/post-card.svelte';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Nyheter og aktuelt · Modulus Barn</title></svelte:head>

<PageHeader
	title="Nyheter og aktuelt"
	description="Hold deg oppdatert på siste nytt fra Modulus Barn. Her finner du informasjon om nye funksjoner, aktuelle tilbud og andre nyheter."
/>

<Tabs.Root
	value={data.kind}
	onValueChange={(v) => goto(v === 'all' ? '/nyheter' : `?type=${v}`)}
	class="mb-8"
>
	<Tabs.List class="h-auto flex-wrap justify-start">
		<Tabs.Trigger value="all">Alle</Tabs.Trigger>
		{#each postKindKeys as key (key)}
			<Tabs.Trigger value={key}>{postKinds[key].plural}</Tabs.Trigger>
		{/each}
	</Tabs.List>
</Tabs.Root>

{#if data.posts.length}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.posts as post (post.id)}
			<PostCard {post} />
		{/each}
	</div>
{:else}
	<Empty.Root class="rounded-lg bg-card">
		<Empty.Header>
			<Empty.Media variant="icon"><Newspaper /></Empty.Media>
			<Empty.Title>Ingenting her ennå</Empty.Title>
			<Empty.Description>Nye funksjoner, tilbud og nyheter dukker opp her.</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/if}
