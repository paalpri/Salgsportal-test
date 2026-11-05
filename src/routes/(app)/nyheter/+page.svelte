<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import PostCard from '#lib/components/app/post-card.svelte';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { goto } from '$app/navigation';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Nyheter · Kommuneportalen</title></svelte:head>

<PageHeader title="Nyheter" description="Nyheter, kampanjer og kunngjøringer." />

<Tabs.Root
	value={data.kind}
	onValueChange={(v) => goto(v === 'all' ? '/nyheter' : `?type=${v}`)}
	class="mb-6"
>
	<Tabs.List>
		<Tabs.Trigger value="all">Alle</Tabs.Trigger>
		<Tabs.Trigger value="news">Nyheter</Tabs.Trigger>
		<Tabs.Trigger value="ad">Kampanjer</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

{#if data.posts.length}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.posts as post (post.id)}
			<PostCard {post} />
		{/each}
	</div>
{:else}
	<Empty.Root class="border">
		<Empty.Header>
			<Empty.Media variant="icon"><Newspaper /></Empty.Media>
			<Empty.Title>Ingen innlegg ennå</Empty.Title>
			<Empty.Description>Nye nyheter og kampanjer dukker opp her.</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/if}
