<script lang="ts">
	import PageHeader from '#lib/components/app/page-header.svelte';
	import CourseDialog from '#lib/components/app/course-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		formatMonth,
		formatShortDate,
		formatTimeRange,
		osloTime,
		courseStatuses
	} from '#lib/courses.ts';
	import { cn } from '#lib/utils.ts';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CalendarX from '@lucide/svelte/icons/calendar-x';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Session = (typeof data.sessions)[number];
	let selected = $state<Session | null>(null);
	let open = $state(false);
	function show(session: Session) {
		selected = session;
		open = true;
	}

	const weekdays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
	const byDate = $derived(
		data.sessions.reduce(
			(map, s) => map.set(s.date, [...(map.get(s.date) ?? []), s]),
			new Map<string, Session[]>()
		)
	);
	const inMonth = (date: string) => date.startsWith(data.month);
	const monthSessions = $derived(data.sessions.filter((s) => inMonth(s.date)));
</script>

<svelte:head><title>Kurskalender · Modulus Barn</title></svelte:head>

<PageHeader
	title="Kurs og påmelding"
	description="Ønsker dere å lære mer om funksjonaliteten i Modulus Barn? Vi tilbyr korte, digitale kurs innen ulike temaer, med fokus på praktisk bruk av løsningen. Se våre planlagte kurs i kalenderen nedenfor, og meld på ansatte til kursene som er relevante for dem. Hvert kurs har et begrenset antall plasser."
/>

<section aria-labelledby="month" class="rounded-lg bg-card">
	<div class="flex items-center justify-between gap-2 border-b p-3 sm:p-4">
		<Button
			href="?maned={data.previous}"
			variant="ghost"
			size="icon-sm"
			aria-label="Forrige måned"
			data-sveltekit-noscroll><ChevronLeft /></Button
		>
		<div class="flex items-center gap-3">
			<h2 id="month" class="text-lg font-medium sm:text-xl">{formatMonth(data.month)}</h2>
			{#if data.month !== data.current}
				<Button href="?maned={data.current}" variant="outline" size="sm" data-sveltekit-noscroll
					>I dag</Button
				>
			{/if}
		</div>
		<Button
			href="?maned={data.next}"
			variant="ghost"
			size="icon-sm"
			aria-label="Neste måned"
			data-sveltekit-noscroll><ChevronRight /></Button
		>
	</div>

	<div class="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
		{#each weekdays as day (day)}<div class="py-2">{day}</div>{/each}
	</div>
	<div class="grid grid-cols-7">
		{#each data.weeks.flat() as date, i (date)}
			{@const sessions = byDate.get(date) ?? []}
			<div
				class={cn(
					'min-h-14 border-b p-1 sm:min-h-28 sm:p-1.5',
					i % 7 !== 6 && 'border-r',
					!inMonth(date) && 'bg-muted/40 text-muted-foreground'
				)}
			>
				<span
					class={cn(
						'inline-flex size-6 items-center justify-center rounded-sm text-xs',
						date === data.today && 'bg-coral font-semibold text-ink'
					)}
					aria-current={date === data.today ? 'date' : undefined}>{Number(date.slice(8))}</span
				>
				<div class="mt-1 flex flex-wrap gap-1 sm:hidden">
					{#each sessions as s (s.id)}
						<span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
					{/each}
				</div>
				<ul class="mt-1 hidden space-y-1 sm:block">
					{#each sessions as s (s.id)}
						<li>
							<button
								type="button"
								onclick={() => show(s)}
								class={cn(
									'w-full rounded-sm bg-primary px-1.5 py-1 text-left text-xs leading-snug text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-coral',
									s.status !== 'open' && 'bg-muted text-muted-foreground hover:bg-muted/70'
								)}
							>
								<span class="font-semibold">{osloTime(s.startsAt)}</span>
								<span class={cn('line-clamp-2', s.status === 'cancelled' && 'line-through')}
									>{s.title}</span
								>
								{#if s.status !== 'open'}<span class="font-semibold"
										>{courseStatuses[s.status].label}</span
									>{/if}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	{#if monthSessions.length}
		<ul class="divide-y sm:hidden">
			{#each monthSessions as s (s.id)}
				<li>
					<button
						type="button"
						onclick={() => show(s)}
						class="flex w-full items-start gap-4 p-4 text-left hover:bg-accent"
					>
						<span class="w-20 shrink-0 text-sm text-muted-foreground"
							>{formatShortDate(s.startsAt)}</span
						>
						<span class="space-y-0.5">
							<span class={cn('block font-medium', s.status === 'cancelled' && 'line-through')}
								>{s.title}</span
							>
							<span class="block text-sm text-muted-foreground">
								{formatTimeRange(s.startsAt, s.endsAt)}
								{#if s.status !== 'open'}· {courseStatuses[s.status].label}{/if}
							</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="flex items-center gap-3 p-6 text-muted-foreground">
			<CalendarX class="size-5 shrink-0" />
			Det er ingen planlagte kurs i denne perioden. Følg gjerne med her for nye kursdatoer.
		</p>
	{/if}
</section>

<CourseDialog bind:open session={selected} />
