<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { postKinds, postKindKeys, type PostKind } from '#lib/post-kinds.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const post = $derived(data.post);
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
	const values = $derived((form && 'values' in form ? form.values : {}) as Record<string, string>);
	const v = (key: keyof NonNullable<typeof data.post>) => values[key] ?? String(post?.[key] ?? '');

	// svelte-ignore state_referenced_locally
	let kind = $state<PostKind>(data.post?.kind ?? 'release');
</script>

<svelte:head><title>{post ? post.title : 'Nytt innlegg'} · Admin</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<Button href="/admin/innlegg" variant="ghost" size="sm" class="mb-2 -ml-2"
		><ArrowLeft /> Alle innlegg</Button
	>
	<PageHeader title={post ? 'Rediger innlegg' : 'Nytt innlegg'}>
		{#snippet actions()}
			{#if post}
				<Button href="/nyheter/{post.slug}" variant="outline" size="sm"><ExternalLink /> Vis</Button
				>
				<ConfirmDelete
					action="?/delete"
					title="Slette innlegget?"
					variant="outline"
					success="Innlegget er slettet"
				/>
			{/if}
		{/snippet}
	</PageHeader>

	<form
		method="post"
		action="?/save"
		use:enhance={withToast(post ? 'Lagret' : 'Innlegget er opprettet', { reset: false })}
	>
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="kind">Type</Field.Label>
							<Select.Root type="single" name="kind" bind:value={kind}>
								<Select.Trigger id="kind" class="w-full">{postKinds[kind].label}</Select.Trigger>
								<Select.Content>
									{#each postKindKeys as key (key)}
										<Select.Item value={key} label={postKinds[key].label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<Field.Description>
								{postKinds[kind].description}
							</Field.Description>
						</Field.Field>
						<Field.Field data-invalid={!!errors.slug}>
							<Field.Label for="slug">Adresse (slug)</Field.Label>
							<Input id="slug" name="slug" value={v('slug')} placeholder="Lages fra tittelen" />
							{#if errors.slug}<Field.Error>{errors.slug}</Field.Error>{/if}
						</Field.Field>
					</div>
					<Field.Field data-invalid={!!errors.title}>
						<Field.Label for="title">Tittel</Field.Label>
						<Input id="title" name="title" value={v('title')} required maxlength={150} />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.excerpt}>
						<Field.Label for="excerpt">Ingress</Field.Label>
						<Textarea id="excerpt" name="excerpt" rows={2} value={v('excerpt')} maxlength={300} />
						{#if errors.excerpt}<Field.Error>{errors.excerpt}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.body}>
						<Field.Label for="body">Innhold</Field.Label>
						<Textarea id="body" name="body" rows={10} class="min-h-48" value={v('body')} />
						<Field.Description>Linjeskift beholdes.</Field.Description>
					</Field.Field>
					<Field.Field data-invalid={!!errors.imageUrl}>
						<Field.Label for="imageUrl">Bilde-URL</Field.Label>
						<Input id="imageUrl" name="imageUrl" value={v('imageUrl')} placeholder="https://…" />
						{#if errors.imageUrl}<Field.Error>{errors.imageUrl}</Field.Error>{/if}
					</Field.Field>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="ctaLabel">Knappetekst</Field.Label>
							<Input
								id="ctaLabel"
								name="ctaLabel"
								value={v('ctaLabel')}
								placeholder="F.eks. Se modulen"
								maxlength={40}
							/>
						</Field.Field>
						<Field.Field data-invalid={!!errors.ctaUrl}>
							<Field.Label for="ctaUrl">Knappelenke</Field.Label>
							<Input
								id="ctaUrl"
								name="ctaUrl"
								value={v('ctaUrl')}
								placeholder="/produkter/… eller https://…"
							/>
							{#if errors.ctaUrl}<Field.Error>{errors.ctaUrl}</Field.Error>{/if}
						</Field.Field>
					</div>
					<Field.Separator />
					<Field.Field orientation="horizontal">
						<Switch id="published" name="published" checked={post?.published ?? false} />
						<Field.Label for="published">Publisert</Field.Label>
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Switch id="pinned" name="pinned" checked={post?.pinned ?? false} />
						<Field.Label for="pinned">Fest øverst</Field.Label>
					</Field.Field>
				</Field.Group>
			</Card.Content>
			<Card.Footer class="justify-end gap-2">
				<Button href="/admin/innlegg" variant="ghost">Avbryt</Button>
				<Button type="submit">{post ? 'Lagre' : 'Opprett'}</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
