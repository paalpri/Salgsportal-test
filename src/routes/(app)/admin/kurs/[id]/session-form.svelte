<script lang="ts">
	import { enhance } from '$app/forms';
	import { withToast } from '#lib/forms.ts';
	import {
		courseStatuses,
		courseStatusKeys,
		formatLongDate,
		osloDate,
		osloTime,
		type CourseStatus
	} from '#lib/courses.ts';
	import ConfirmDelete from '#lib/components/app/confirm-delete.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	type Props = {
		session?: {
			id: number;
			startsAt: Date;
			endsAt: Date;
			signupUrl: string;
			capacity: number | null;
			status: CourseStatus;
		};
	};
	let { session }: Props = $props();

	const key = $derived(session ? `s${session.id}` : 'ny');
	// svelte-ignore state_referenced_locally
	let status = $state<CourseStatus>(session?.status ?? 'open');
</script>

<div class="space-y-3">
	<form
		id="{key}-form"
		method="post"
		action={session ? '?/updateSession' : '?/addSession'}
		aria-label={session ? `Kursdato ${formatLongDate(session.startsAt)}` : 'Ny kursdato'}
		class="space-y-3"
		use:enhance={withToast(session ? 'Kursdatoen er lagret' : 'Kursdatoen er lagt til', {
			reset: !session
		})}
	>
		{#if session}<input type="hidden" name="id" value={session.id} />{/if}
		<div class="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
			<Field.Field>
				<Field.Label for="{key}-date">Dato</Field.Label>
				<Input
					id="{key}-date"
					name="date"
					type="date"
					required
					value={session ? osloDate(session.startsAt) : ''}
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for="{key}-start">Start</Field.Label>
				<Input
					id="{key}-start"
					name="start"
					type="time"
					required
					value={session ? osloTime(session.startsAt) : '09:00'}
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for="{key}-end">Slutt</Field.Label>
				<Input
					id="{key}-end"
					name="end"
					type="time"
					required
					value={session ? osloTime(session.endsAt) : '11:00'}
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for="{key}-capacity">Maks deltakere</Field.Label>
				<Input
					id="{key}-capacity"
					name="capacity"
					type="number"
					min="1"
					value={session?.capacity ?? ''}
					placeholder="Valgfritt"
				/>
			</Field.Field>
		</div>
		<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
			<Field.Field>
				<Field.Label for="{key}-signupUrl">Påmeldingslenke</Field.Label>
				<Input
					id="{key}-signupUrl"
					name="signupUrl"
					type="url"
					required
					value={session?.signupUrl ?? ''}
					placeholder="https://…"
				/>
			</Field.Field>
			{#if session}
				<Field.Field>
					<Field.Label for="{key}-status">Status</Field.Label>
					<Select.Root type="single" name="status" bind:value={status}>
						<Select.Trigger id="{key}-status" class="w-full sm:w-48"
							>{courseStatuses[status].label}</Select.Trigger
						>
						<Select.Content>
							{#each courseStatusKeys as s (s)}
								<Select.Item value={s} label={courseStatuses[s].label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</Field.Field>
			{/if}
		</div>
	</form>
	<div class="flex items-center justify-end gap-2">
		{#if session}
			<ConfirmDelete
				action="?/deleteSession"
				title="Slette kursdatoen?"
				description="Datoen fjernes fra kurskalenderen."
				fields={{ id: session.id }}
				success="Kursdatoen er slettet"
			/>
			<Button type="submit" form="{key}-form" variant="outline" size="sm">Lagre</Button>
		{:else}
			<Button type="submit" form="{key}-form" size="sm"><Plus /> Legg til</Button>
		{/if}
	</div>
</div>
