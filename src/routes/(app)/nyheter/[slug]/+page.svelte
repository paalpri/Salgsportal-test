<script lang="ts">
	import { formatDate } from '#lib/format.ts';
	import PostKindTag from '#lib/components/app/post-kind-tag.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Pencil from '@lucide/svelte/icons/pencil';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
</script>

<svelte:head><title>{post.title} · Modulus Barn</title></svelte:head>

<article class="mx-auto max-w-3xl space-y-6">
	<div class="flex items-center justify-between">
		<Button href="/nyheter" variant="ghost" size="sm" class="-ml-2"
			><ArrowLeft /> Alle nyheter</Button
		>
		{#if data.isAdmin}
			<Button href="/admin/innlegg/{post.id}" variant="outline" size="sm"><Pencil /> Rediger</Button
			>
		{/if}
	</div>

	{#if !post.published}
		<Alert.Root>
			<EyeOff />
			<Alert.Title>Ikke publisert</Alert.Title>
			<Alert.Description>Bare administratorer kan se dette innlegget.</Alert.Description>
		</Alert.Root>
	{/if}

	<header class="space-y-3">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<PostKindTag kind={post.kind} />
			{#if post.publishedAt}<time>{formatDate(post.publishedAt)}</time>{/if}
			{#if data.authorName}<span>· {data.authorName}</span>{/if}
		</div>
		<h1 class="text-3xl font-normal md:text-4xl">{post.title}</h1>
		{#if post.excerpt}<p class="text-lg text-muted-foreground">{post.excerpt}</p>{/if}
	</header>

	{#if post.imageUrl}
		<img src={post.imageUrl} alt="" class="aspect-[16/9] w-full rounded-xl object-cover" />
	{/if}

	<div class="leading-7 whitespace-pre-line">{post.body}</div>

	{#if post.ctaUrl}
		<Button href={post.ctaUrl} size="lg">{post.ctaLabel ?? 'Les mer'} <ArrowRight /></Button>
	{/if}
</article>
