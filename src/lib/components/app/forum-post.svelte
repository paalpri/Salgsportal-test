<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { initials, timeAgo } from '#lib/format.ts';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { cn } from '#lib/utils.ts';
	import Pencil from '@lucide/svelte/icons/pencil';

	type Props = {
		author: {
			name: string | null;
			jobTitle: string | null;
			role: string | null;
			municipalityName: string | null;
		} | null;
		body: string;
		createdAt: Date;
		editedAt: Date | null;
		canEdit: boolean;
		editAction: string;
		title?: string;
		hidden?: Record<string, string | number>;
		highlight?: boolean;
		badge?: Snippet;
		actions?: Snippet;
	};
	let {
		author,
		body,
		createdAt,
		editedAt,
		canEdit,
		editAction,
		title,
		hidden = {},
		highlight = false,
		badge,
		actions
	}: Props = $props();
	let editing = $state(false);
</script>

<div
	class={cn(
		'rounded-xl border bg-card p-4 md:p-5',
		highlight && 'border-emerald-500/50 bg-emerald-500/5'
	)}
>
	<div class="flex items-start gap-3">
		<Avatar.Root class="size-9">
			<Avatar.Fallback
				class={cn(
					author?.role === 'admin'
						? 'bg-primary text-primary-foreground'
						: 'bg-primary/10 text-primary'
				)}
			>
				{author?.name ? initials(author.name) : '?'}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
				<span class="font-medium">{author?.name ?? 'Slettet bruker'}</span>
				{#if author?.role === 'admin'}<Badge variant="secondary">Leverandør</Badge>{/if}
				{@render badge?.()}
			</div>
			<p class="text-xs text-muted-foreground">
				{[author?.jobTitle, author?.municipalityName].filter(Boolean).join(', ')}
				{author?.jobTitle || author?.municipalityName ? '·' : ''}
				{timeAgo(createdAt)}{editedAt ? ' · redigert' : ''}
			</p>
		</div>
		{#if canEdit && !editing}
			<Button variant="ghost" size="icon-sm" onclick={() => (editing = true)} aria-label="Rediger"
				><Pencil /></Button
			>
		{/if}
	</div>

	{#if editing}
		<form
			method="post"
			action={editAction}
			class="mt-4 space-y-3"
			use:enhance={withToast('Lagret', { reset: false, onSuccess: () => (editing = false) })}
		>
			{#each Object.entries(hidden) as [name, value] (name)}
				<input type="hidden" {name} {value} />
			{/each}
			{#if title !== undefined}<Input name="title" value={title} maxlength={150} required />{/if}
			<Textarea name="body" value={body} rows={6} required />
			<div class="flex justify-end gap-2">
				<Button type="button" variant="ghost" onclick={() => (editing = false)}>Avbryt</Button>
				<Button type="submit">Lagre</Button>
			</div>
		</form>
	{:else}
		<div class="mt-3 leading-7 break-words whitespace-pre-line md:pl-12">{body}</div>
		{#if actions}<div class="mt-3 flex flex-wrap gap-1 md:pl-12">{@render actions()}</div>{/if}
	{/if}
</div>
