<script lang="ts">
	import { formatDate } from '#lib/format.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Megaphone from '@lucide/svelte/icons/megaphone';

	type Props = {
		post: {
			slug: string;
			kind: 'news' | 'ad';
			title: string;
			excerpt: string;
			imageUrl: string | null;
			publishedAt: Date | null;
		};
	};
	let { post }: Props = $props();
	const Icon = $derived(post.kind === 'ad' ? Megaphone : Newspaper);
</script>

<a href="/nyheter/{post.slug}" class="group block h-full">
	<Card.Root class="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
		<div class="aspect-[16/9] overflow-hidden bg-muted">
			{#if post.imageUrl}
				<img src={post.imageUrl} alt="" class="size-full object-cover" />
			{:else}
				<div
					class="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-transparent"
				>
					<Icon class="size-10 text-primary/50" />
				</div>
			{/if}
		</div>
		<Card.Header>
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				{#if post.kind === 'ad'}<Badge variant="outline">Kampanje</Badge>{/if}
				{#if post.publishedAt}<span>{formatDate(post.publishedAt)}</span>{/if}
			</div>
			<Card.Title class="group-hover:underline">{post.title}</Card.Title>
			<Card.Description class="line-clamp-3">{post.excerpt}</Card.Description>
		</Card.Header>
	</Card.Root>
</a>
