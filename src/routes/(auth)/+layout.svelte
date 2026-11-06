<script lang="ts">
	import { page } from '$app/state';
	import Logo from '#lib/components/app/logo.svelte';
	import DemoUserPicker from '#lib/components/app/demo-user-picker.svelte';
	import MessagesSquare from '@lucide/svelte/icons/messages-square';
	import Package from '@lucide/svelte/icons/package';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const highlights = [
		{
			icon: Newspaper,
			title: 'Nytt i løsningen',
			text: 'Endringer, nye versjoner og driftsmeldinger for Modulus Barn.'
		},
		{
			icon: Package,
			title: 'Moduler og tjenester',
			text: 'Se hva som er nytt, og samle bestillingen i kommunens handleliste.'
		},
		{
			icon: MessagesSquare,
			title: 'Erfaringer fra andre kommuner',
			text: 'Spør, svar og bidra til hvordan løsningen utvikles videre.'
		}
	];
	const demo = $derived(
		page.data.demoUsers as
			{ key: string; name: string; label: string; description: string }[] | null | undefined
	);
	const selected = $derived((page.data.prefill as { key: string } | null | undefined)?.key ?? null);
</script>

<div class="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
	<div class="flex flex-col bg-card px-6 py-8 sm:px-10 lg:px-14">
		<a href="/" class="w-fit"><Logo /></a>
		<div class="flex flex-1 items-center justify-center py-12">
			<div class="w-full max-w-sm">{@render children()}</div>
		</div>
		<p class="text-xs text-muted-foreground">
			Kommuneportalen for Modulus Barn er levert og driftet av Netcompany.
		</p>
	</div>

	<aside
		class="relative hidden overflow-hidden bg-brand text-white lg:flex lg:flex-col lg:justify-between lg:gap-12 lg:p-14 xl:p-16"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.07)_1px,transparent_1px)] bg-[size:25%_33.333%]"
		></div>
		<div class="relative max-w-xl space-y-5">
			<p class="text-sm text-white/70">DigiBarnevern · Modulus Barn</p>
			<h2 class="text-4xl leading-[1.1] font-normal xl:text-5xl">
				Møteplassen for kommunene som bruker Modulus Barn.
			</h2>
		</div>
		<div class="relative max-w-xl">
			{#if demo?.length}
				<DemoUserPicker users={demo} {selected} tone="dark" />
			{:else}
				<ul class="grid gap-6">
					{#each highlights as item (item.title)}
						<li class="flex gap-4">
							<span
								class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-white/10"
							>
								<item.icon class="size-5" />
							</span>
							<div>
								<p class="font-medium">{item.title}</p>
								<p class="text-sm text-white/70">{item.text}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>
</div>
