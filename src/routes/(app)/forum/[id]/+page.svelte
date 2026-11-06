<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import ForumPost from '#lib/components/app/forum-post.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const thread = $derived(data.thread);
	const ownsThread = $derived(data.me.isAdmin || thread.authorId === data.me.id);
	const canReply = $derived(!thread.locked || data.me.isAdmin);
	const accepted = $derived(data.replies.find((r) => r.reply.id === thread.acceptedReplyId));
</script>

<svelte:head><title>{thread.title} · Forum</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<Button href="/forum?kategori={data.category.slug}" variant="ghost" size="sm" class="-ml-2">
			<ArrowLeft />
			{data.category.name}
		</Button>
		{#if data.me.isAdmin}
			<div class="flex gap-1">
				<form
					method="post"
					action="?/moderate"
					use:enhance={withToast(thread.pinned ? 'Løsnet' : 'Festet')}
				>
					<input type="hidden" name="field" value="pinned" />
					<Button type="submit" variant="outline" size="sm">
						{#if thread.pinned}<PinOff /> Løsne{:else}<Pin /> Fest{/if}
					</Button>
				</form>
				<form
					method="post"
					action="?/moderate"
					use:enhance={withToast(thread.locked ? 'Åpnet' : 'Låst')}
				>
					<input type="hidden" name="field" value="locked" />
					<Button type="submit" variant="outline" size="sm">
						{#if thread.locked}<LockOpen /> Åpne{:else}<Lock /> Lås{/if}
					</Button>
				</form>
			</div>
		{/if}
	</div>

	<header class="space-y-2">
		<div class="flex flex-wrap gap-2">
			{#if thread.pinned}<Badge variant="outline" class="gap-1"><Pin class="size-3" /> Festet</Badge
				>{/if}
			{#if thread.locked}<Badge variant="outline" class="gap-1"><Lock class="size-3" /> Låst</Badge
				>{/if}
			{#if accepted}
				<Badge class="gap-1 bg-success/10 text-success">
					<CircleCheck class="size-3" /> Løst
				</Badge>
			{/if}
		</div>
		<h1 class="text-3xl font-normal md:text-4xl">{thread.title}</h1>
	</header>

	<ForumPost
		author={data.author}
		body={thread.body}
		title={thread.title}
		createdAt={thread.createdAt}
		editedAt={thread.editedAt}
		canEdit={ownsThread}
		editAction="?/editThread"
	>
		{#snippet actions()}
			{#if ownsThread}
				<ConfirmDelete
					action="?/deleteThread"
					title="Slette tråden?"
					description="Tråden og alle svar slettes permanent."
					success="Tråden er slettet"
				/>
			{/if}
		{/snippet}
	</ForumPost>

	<section class="space-y-3">
		<h2 class="text-sm font-medium text-muted-foreground">
			{data.replies.length} svar
		</h2>
		{#each data.replies as { reply, author } (reply.id)}
			{@const isAccepted = reply.id === thread.acceptedReplyId}
			{@const ownsReply = data.me.isAdmin || reply.authorId === data.me.id}
			<ForumPost
				{author}
				body={reply.body}
				createdAt={reply.createdAt}
				editedAt={reply.editedAt}
				canEdit={ownsReply}
				editAction="?/editReply"
				hidden={{ replyId: reply.id }}
				highlight={isAccepted}
			>
				{#snippet badge()}
					{#if isAccepted}
						<Badge class="gap-1 bg-success text-white"><CircleCheck class="size-3" /> Løsning</Badge
						>
					{/if}
				{/snippet}
				{#snippet actions()}
					{#if ownsThread}
						<form
							method="post"
							action="?/accept"
							use:enhance={withToast(isAccepted ? 'Løsning fjernet' : 'Markert som løsning')}
						>
							<input type="hidden" name="replyId" value={reply.id} />
							<Button type="submit" variant="ghost" size="sm">
								<CircleCheck />
								{isAccepted ? 'Fjern løsning' : 'Marker som løsning'}
							</Button>
						</form>
					{/if}
					{#if ownsReply}
						<ConfirmDelete
							action="?/deleteReply"
							title="Slette svaret?"
							fields={{ replyId: reply.id }}
							success="Svaret er slettet"
						/>
					{/if}
				{/snippet}
			</ForumPost>
		{/each}
	</section>

	{#if canReply}
		<form
			method="post"
			action="?/reply"
			class="space-y-3 rounded-lg bg-card p-5 md:p-6"
			use:enhance={withToast('Svaret er publisert')}
		>
			<label for="reply" class="text-sm font-medium">Skriv et svar</label>
			<Textarea id="reply" name="body" rows={4} placeholder="Del erfaringen din …" required />
			<div class="flex justify-end"><Button type="submit">Svar</Button></div>
		</form>
	{:else}
		<Alert.Root>
			<Lock />
			<Alert.Title>Tråden er låst</Alert.Title>
			<Alert.Description>Det er ikke mulig å svare på denne tråden.</Alert.Description>
		</Alert.Root>
	{/if}
</div>
