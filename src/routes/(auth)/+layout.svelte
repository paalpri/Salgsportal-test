<script lang="ts">
	import Logo from '#lib/components/app/logo.svelte';
	import MessagesSquare from '@lucide/svelte/icons/messages-square';
	import Package from '@lucide/svelte/icons/package';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import { site } from '#lib/site.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const highlights = [
		{
			icon: MessagesSquare,
			title: 'Hjelp hverandre',
			text: 'Del erfaringer og løsninger med andre kommuner i forumet.'
		},
		{
			icon: Newspaper,
			title: 'Hold deg oppdatert',
			text: 'Nyheter, kampanjer og endringer i barnevernssystemet.'
		},
		{
			icon: Package,
			title: 'Bestill enkelt',
			text: 'Se nye moduler og tjenester, og samle dem i kommunens handleliste.'
		}
	];
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<a href="/" class="w-fit"><Logo /></a>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-sm">{@render children()}</div>
		</div>
	</div>
	<div
		class="relative hidden flex-col justify-center gap-10 overflow-hidden bg-brand p-12 text-white lg:flex"
	>
		<div
			class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
		></div>
		<div class="max-w-md space-y-3">
			<h2 class="text-3xl font-semibold tracking-tight">{site.name}</h2>
			<p class="text-lg text-white/80">{site.tagline}.</p>
		</div>
		<ul class="max-w-md space-y-6">
			{#each highlights as item (item.title)}
				<li class="flex gap-4">
					<span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
						<item.icon class="size-5" />
					</span>
					<div>
						<p class="font-medium">{item.title}</p>
						<p class="text-sm text-white/75">{item.text}</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
