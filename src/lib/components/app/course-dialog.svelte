<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		agendaItems,
		courseStatuses,
		formatDuration,
		formatLongDate,
		formatTimeRange,
		type CourseStatus
	} from '#lib/courses.ts';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	type Props = {
		open: boolean;
		session: {
			title: string;
			description: string;
			agenda: string;
			audience: string;
			startsAt: Date;
			endsAt: Date;
			signupUrl: string;
			capacity: number | null;
			status: CourseStatus;
		} | null;
	};
	let { open = $bindable(), session }: Props = $props();

	const closedReason = $derived.by(() => {
		if (!session) return null;
		if (session.status === 'cancelled') return 'Kurset er avlyst.';
		if (session.endsAt.getTime() < Date.now()) return 'Kurset er gjennomført.';
		if (session.status === 'full') return 'Kurset er fulltegnet.';
		return null;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90svh] overflow-y-auto sm:max-w-xl">
		{#if session}
			<Dialog.Header class="pr-8">
				{#if session.status !== 'open'}
					<span class="w-fit rounded-sm bg-coral px-2 py-0.5 text-xs font-semibold text-ink"
						>{courseStatuses[session.status].label}</span
					>
				{/if}
				<Dialog.Title class="text-2xl font-normal">{session.title}</Dialog.Title>
				<Dialog.Description class="text-base first-letter:uppercase">
					{formatLongDate(session.startsAt)}, kl. {formatTimeRange(
						session.startsAt,
						session.endsAt
					)}
				</Dialog.Description>
			</Dialog.Header>

			<dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Varighet</dt>
					<dd>{formatDuration(session.startsAt, session.endsAt)}</dd>
				</div>
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Gjennomføring</dt>
					<dd>Digitalt via Microsoft Teams</dd>
				</div>
				{#if session.audience}
					<div>
						<dt class="text-xs tracking-wide text-muted-foreground uppercase">Målgruppe</dt>
						<dd>{session.audience}</dd>
					</div>
				{/if}
				{#if session.capacity}
					<div>
						<dt class="text-xs tracking-wide text-muted-foreground uppercase">Kapasitet</dt>
						<dd>Inntil {session.capacity} deltakere</dd>
					</div>
				{/if}
			</dl>

			{#if session.description}
				<p class="leading-relaxed whitespace-pre-line">{session.description}</p>
			{/if}

			{#if agendaItems(session.agenda).length}
				<div>
					<h3 class="mb-2 font-medium">Agenda</h3>
					<ul class="list-disc space-y-1 pl-5">
						{#each agendaItems(session.agenda) as item, i (i)}<li>{item}</li>{/each}
					</ul>
				</div>
			{/if}

			<Dialog.Footer class="flex-col items-stretch gap-2 border-t pt-4 sm:flex-col sm:items-end">
				{#if closedReason}
					<p class="font-medium">{closedReason}</p>
				{:else}
					<Button href={session.signupUrl} target="_blank" rel="noopener noreferrer" size="lg">
						Meld på kursdeltaker <ExternalLink />
					</Button>
					<p class="text-xs text-muted-foreground">Påmeldingen gjennomføres på en ekstern side.</p>
				{/if}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
