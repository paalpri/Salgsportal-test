<script lang="ts">
	import type { PostKind } from '#lib/post-kinds.ts';
	import { formatDate } from '#lib/format.ts';
	import PostKindTag from './post-kind-tag.svelte';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	type Props = {
		post: {
			slug: string;
			kind: PostKind;
			title: string;
			excerpt: string;
			imageUrl: string | null;
			publishedAt: Date | null;
		};
	};
	let { post }: Props = $props();
	const icons = { release: Sparkles, news: Newspaper, ad: Megaphone };
	const Icon = $derived(icons[post.kind]);
</script>

<a
	href="/nyheter/{post.slug}"
	class="card-link group flex h-full flex-col overflow-hidden rounded-lg bg-card"
>
	{#if post.imageUrl}
		<div class="aspect-[16/9] overflow-hidden bg-muted">
			<img src={post.imageUrl} alt="" class="size-full object-cover" />
		</div>
	{/if}
	<div class="flex flex-1 flex-col gap-2 p-6">
		{#if !post.imageUrl}<Icon class="mb-2 size-8" strokeWidth={1.5} />{/if}
		<p class="flex items-center gap-2 text-xs text-muted-foreground">
			<PostKindTag kind={post.kind} />
			{#if post.publishedAt}<time>{formatDate(post.publishedAt)}</time>{/if}
		</p>
		<h3
			class="text-lg leading-snug font-medium group-hover:underline group-hover:underline-offset-4"
		>
			{post.title}
		</h3>
		<p class="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
	</div>
</a>
