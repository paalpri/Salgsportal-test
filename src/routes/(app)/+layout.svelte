<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import AppSidebar from '#lib/components/app/app-sidebar.svelte';
	import { site } from '#lib/site.ts';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Plus from '@lucide/svelte/icons/plus';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset class="bg-background">
		<header
			class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6"
		>
			<Sidebar.Trigger class="-ml-1" />
			{#if data.user?.isAdmin}
				<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
				<span class="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
					<ShieldCheck class="size-4 shrink-0" />
					<span class="truncate">Administrator · Netcompany</span>
				</span>
			{:else}
				<Button href="/onsker#nytt-onske" variant="outline" size="sm" class="ml-auto">
					<Plus /> Nytt ønske
				</Button>
			{/if}
		</header>
		<div id="innhold" class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-12">
			{@render children()}
		</div>
		<footer class="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-muted-foreground md:px-10">
			{site.portal} · levert og driftet av Netcompany
		</footer>
	</Sidebar.Inset>
</Sidebar.Provider>
