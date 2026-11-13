<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import { KEY_FIGURE_SLOTS, type Welcome } from '#lib/site-content.ts';
	import PageHeader from '#lib/components/app/page-header.svelte';
	import WelcomeHero from '#lib/components/app/welcome-hero.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	// A fresh editable copy whenever the saved content changes (after save or reset).
	const draft = $derived.by(() => {
		const figures = Array.from({ length: KEY_FIGURE_SLOTS }, (_, i) => ({
			...(data.welcome.figures[i] ?? { value: '', label: '' })
		}));
		const copy = $state<Welcome>({ ...data.welcome, figures });
		return copy;
	});
	const errors = $derived((form && 'errors' in form ? form.errors : {}) as Record<string, string>);
</script>

<svelte:head><title>Forside · Admin</title></svelte:head>

<PageHeader
	title="Forside"
	description="Velkomstseksjonen øverst på forsiden. Den er lik for alle kommunebrukere og kan bare endres her."
>
	{#snippet actions()}
		<Button href="/" variant="outline"><ExternalLink /> Se forsiden</Button>
	{/snippet}
</PageHeader>

<div class="space-y-8">
	<section class="space-y-3">
		<h2 class="text-sm font-medium text-muted-foreground">Forhåndsvisning</h2>
		<WelcomeHero welcome={draft} greeting="Hei, {data.user.name.split(' ')[0]}" />
	</section>

	<form
		method="post"
		action="?/save"
		use:enhance={withToast('Forsiden er oppdatert', { reset: false })}
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Innhold</Card.Title>
				<Card.Description
					>Hilsenen «Hei, fornavn» legges til automatisk for hver bruker.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={!!errors.eyebrow}>
						<Field.Label for="eyebrow">Overlinje</Field.Label>
						<Input id="eyebrow" name="eyebrow" bind:value={draft.eyebrow} maxlength={120} />
					</Field.Field>
					<Field.Field data-invalid={!!errors.title}>
						<Field.Label for="title">Overskrift</Field.Label>
						<Input id="title" name="title" bind:value={draft.title} maxlength={120} required />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={!!errors.body}>
						<Field.Label for="body">Tekst</Field.Label>
						<Textarea
							id="body"
							name="body"
							class="min-h-28"
							bind:value={draft.body}
							maxlength={600}
						/>
						{#if errors.body}<Field.Error>{errors.body}</Field.Error>{/if}
					</Field.Field>
					<div class="grid gap-6 md:grid-cols-2">
						<Field.Field>
							<Field.Label for="primaryLabel">Hovedknapp, tekst</Field.Label>
							<Input
								id="primaryLabel"
								name="primaryLabel"
								bind:value={draft.primaryLabel}
								maxlength={40}
							/>
						</Field.Field>
						<Field.Field data-invalid={!!errors.primaryUrl}>
							<Field.Label for="primaryUrl">Hovedknapp, lenke</Field.Label>
							<Input
								id="primaryUrl"
								name="primaryUrl"
								bind:value={draft.primaryUrl}
								placeholder="/produkter"
							/>
							{#if errors.primaryUrl}<Field.Error>{errors.primaryUrl}</Field.Error>{/if}
						</Field.Field>
						<Field.Field>
							<Field.Label for="secondaryLabel">Sekundærknapp, tekst</Field.Label>
							<Input
								id="secondaryLabel"
								name="secondaryLabel"
								bind:value={draft.secondaryLabel}
								maxlength={40}
							/>
						</Field.Field>
						<Field.Field data-invalid={!!errors.secondaryUrl}>
							<Field.Label for="secondaryUrl">Sekundærknapp, lenke</Field.Label>
							<Input
								id="secondaryUrl"
								name="secondaryUrl"
								bind:value={draft.secondaryUrl}
								placeholder="/forum"
							/>
							{#if errors.secondaryUrl}<Field.Error>{errors.secondaryUrl}</Field.Error>{/if}
						</Field.Field>
					</div>
					<Field.Set>
						<Field.Legend variant="label">Nøkkeltall</Field.Legend>
						<Field.Description>
							Vises nederst i velkomstseksjonen. Tomme rader skjules. Oppdater tallene når flere
							kommuner tar i bruk løsningen.
						</Field.Description>
						<div class="grid gap-3">
							{#each draft.figures as figure, i (i)}
								<div class="grid gap-3 sm:grid-cols-[10rem_1fr]">
									<Input
										name="figure{i}Value"
										bind:value={figure.value}
										placeholder="F.eks. 157"
										maxlength={20}
										aria-label="Nøkkeltall {i + 1}, tall"
									/>
									<Input
										name="figure{i}Label"
										bind:value={figure.label}
										placeholder="F.eks. kommuner bruker Modulus Barn"
										maxlength={80}
										aria-label="Nøkkeltall {i + 1}, tekst"
									/>
								</div>
							{/each}
						</div>
					</Field.Set>
					<Field.Field data-invalid={!!errors.imageUrl}>
						<Field.Label for="imageUrl">Bilde-URL</Field.Label>
						<Input
							id="imageUrl"
							name="imageUrl"
							bind:value={draft.imageUrl}
							placeholder="https://… (valgfritt)"
						/>
						<Field.Description
							>Vises til høyre for teksten på store skjermer. La stå tomt for kun tekst.</Field.Description
						>
						{#if errors.imageUrl}<Field.Error>{errors.imageUrl}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
			<Card.Footer class="justify-between gap-2 border-t">
				<Button type="submit" formaction="?/reset" formnovalidate variant="ghost">
					<RotateCcw /> Gjenopprett standardtekst
				</Button>
				<Button type="submit">Lagre forsiden</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
