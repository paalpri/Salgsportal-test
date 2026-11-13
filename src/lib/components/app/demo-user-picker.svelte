<script lang="ts">
	import { page } from '$app/state';
	import { initials } from '#lib/format.ts';
	import { cn } from '#lib/utils.ts';
	import Check from '@lucide/svelte/icons/check';

	type DemoUser = { key: string; name: string; label: string; description: string };
	type Props = { users: DemoUser[]; selected?: string | null; tone?: 'dark' | 'light' };
	let { users, selected = null, tone = 'light' }: Props = $props();

	function hrefFor(key: string) {
		const params = new URLSearchParams({ ...Object.fromEntries(page.url.searchParams), demo: key });
		return `/logg-inn?${params}`;
	}
	const dark = $derived(tone === 'dark');
</script>

<section aria-labelledby="demo-users-title" class="space-y-4">
	<div class="space-y-1.5">
		<p class="flex items-center gap-2">
			<span class="rounded-sm bg-coral px-1.5 py-0.5 text-xs font-semibold text-ink">Testmodus</span
			>
			<span id="demo-users-title" class={cn('text-sm font-medium', dark ? 'text-white' : '')}>
				Logg inn som testbruker
			</span>
		</p>
		<p class={cn('text-sm', dark ? 'text-white/70' : 'text-muted-foreground')}>
			Velg en bruker for å fylle inn skjemaet. Vises bare mens vi tester.
		</p>
	</div>
	<ul class="grid gap-2 sm:grid-cols-2">
		{#each users as user (user.key)}
			{@const active = user.key === selected}
			<li>
				<a
					href={hrefFor(user.key)}
					data-sveltekit-replacestate
					data-sveltekit-noscroll
					aria-current={active ? 'true' : undefined}
					class={cn(
						'flex h-full items-start gap-3 rounded-md p-3 outline-coral transition-[outline-width,background-color] duration-150 hover:outline-2 focus-visible:outline-2',
						dark ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-muted hover:bg-accent',
						active && 'outline-2'
					)}
				>
					<span
						class={cn(
							'flex size-9 shrink-0 items-center justify-center rounded-sm text-sm font-semibold',
							dark ? 'bg-white text-brand' : 'bg-brand text-white'
						)}
					>
						{initials(user.name)}
					</span>
					<span class="min-w-0 flex-1 space-y-0.5">
						<span class="flex items-center justify-between gap-2">
							<span class={cn('truncate text-sm font-medium', dark && 'text-white')}
								>{user.label}</span
							>
							{#if active}<Check class="size-4 shrink-0 text-coral" aria-label="Valgt" />{/if}
						</span>
						<span class={cn('block text-xs', dark ? 'text-white/65' : 'text-muted-foreground')}>
							{user.name} · {user.description}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
