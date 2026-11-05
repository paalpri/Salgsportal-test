<script lang="ts">
	import type { ThreadListItem } from '#lib/server/forum.ts';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { timeAgo } from '#lib/format.ts';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Pin from '@lucide/svelte/icons/pin';
	import Lock from '@lucide/svelte/icons/lock';

	let { threads, showCategory = true }: { threads: ThreadListItem[]; showCategory?: boolean } =
		$props();
</script>

<ul class="divide-y rounded-xl border bg-card">
	{#each threads as t (t.id)}
		<li>
			<a
				href="/forum/{t.id}"
				class="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
			>
				<div class="min-w-0 flex-1 space-y-1">
					<div class="flex flex-wrap items-center gap-2">
						{#if t.pinned}<Pin class="size-3.5 text-primary" aria-label="Festet" />{/if}
						{#if t.locked}<Lock class="size-3.5 text-muted-foreground" aria-label="Låst" />{/if}
						<span class="font-medium">{t.title}</span>
						{#if t.solved}
							<Badge variant="secondary" class="gap-1 text-emerald-700 dark:text-emerald-400">
								<CircleCheck class="size-3" /> Løst
							</Badge>
						{/if}
					</div>
					<p class="text-sm text-muted-foreground">
						{t.authorName ?? 'Slettet bruker'}{t.municipalityName ? `, ${t.municipalityName}` : ''}
						· {timeAgo(t.lastActivityAt)}
						{#if showCategory}· {t.category.name}{/if}
					</p>
				</div>
				<span class="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
					<MessageCircle class="size-4" />
					{t.replyCount}
				</span>
			</a>
		</li>
	{/each}
</ul>
