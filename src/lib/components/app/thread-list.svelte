<script lang="ts">
	import type { ThreadListItem } from '#lib/server/forum.ts';
	import { timeAgo } from '#lib/format.ts';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Pin from '@lucide/svelte/icons/pin';
	import Lock from '@lucide/svelte/icons/lock';

	let { threads, showCategory = true }: { threads: ThreadListItem[]; showCategory?: boolean } =
		$props();
</script>

<ul class="divide-y overflow-hidden rounded-lg bg-card">
	{#each threads as t (t.id)}
		<li>
			<a
				href="/forum/{t.id}"
				class="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted md:px-6"
			>
				<div class="min-w-0 flex-1 space-y-1.5">
					<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
						{#if t.pinned}<Pin class="size-3.5 text-coral" aria-label="Festet" />{/if}
						{#if t.locked}<Lock class="size-3.5 text-muted-foreground" aria-label="Låst" />{/if}
						<span class="font-medium group-hover:underline group-hover:underline-offset-4"
							>{t.title}</span
						>
						{#if t.solved}
							<span
								class="inline-flex items-center gap-1 rounded-sm bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success"
							>
								<CircleCheck class="size-3" /> Løst
							</span>
						{/if}
					</div>
					<p class="text-sm text-muted-foreground">
						{t.authorName ?? 'Slettet bruker'}{t.municipalityName ? `, ${t.municipalityName}` : ''}
						· {timeAgo(t.lastActivityAt)}
						{#if showCategory}· {t.category.name}{/if}
					</p>
				</div>
				<span
					class="flex shrink-0 items-center gap-1.5 pt-0.5 text-sm text-muted-foreground tabular-nums"
				>
					<MessageCircle class="size-4" />
					{t.replyCount}
				</span>
			</a>
		</li>
	{/each}
</ul>
