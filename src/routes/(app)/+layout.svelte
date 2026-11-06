<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import AppSidebar from '#lib/components/app/app-sidebar.svelte';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Landmark from '@lucide/svelte/icons/landmark';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} enabled={data.modules} cartCount={data.cartCount} />
	<Sidebar.Inset class="bg-background">
		<header
			class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
			<span class="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
				{#if data.user.municipalityName}
					<Landmark class="size-4 shrink-0" />
					<span class="truncate">{data.user.municipalityName} kommune</span>
				{:else if data.user.isAdmin}
					<ShieldCheck class="size-4 shrink-0" />
					<span class="truncate">Administrator · Netcompany</span>
				{/if}
			</span>
			{#if data.modules.includes('cart') && data.user.municipalityId}
				<Button href="/handleliste" variant="outline" size="sm" class="ml-auto gap-2">
					<ShoppingCart />
					Handleliste
					{#if data.cartCount > 0}
						<span class="rounded-sm bg-coral px-1.5 text-xs leading-5 font-semibold text-ink">
							{data.cartCount}
						</span>
					{/if}
				</Button>
			{/if}
		</header>
		<div id="innhold" class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-12">
			{@render children()}
		</div>
		<footer
			class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-8 text-xs text-muted-foreground md:px-10"
		>
			<span>Kommuneportalen · levert og driftet av Netcompany</span>
			{#if data.modules.includes('forum')}
				<a href="/forum" class="hover:text-foreground">Trenger du hjelp? Spør i forumet</a>
			{/if}
		</footer>
	</Sidebar.Inset>
</Sidebar.Provider>
