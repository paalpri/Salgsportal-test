<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import AppSidebar from '#lib/components/app/app-sidebar.svelte';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} enabled={data.modules} cartCount={data.cartCount} />
	<Sidebar.Inset>
		<header
			class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<span class="truncate text-sm text-muted-foreground">
				{data.user.municipalityName ?? (data.user.isAdmin ? 'Administrator' : '')}
			</span>
			{#if data.modules.includes('cart') && data.user.municipalityId}
				<Button href="/handleliste" variant="ghost" size="sm" class="ml-auto">
					<ShoppingCart />
					Handleliste
					{#if data.cartCount > 0}
						<span
							class="ml-0.5 rounded-full bg-primary px-1.5 text-xs leading-5 font-medium text-primary-foreground"
							>{data.cartCount}</span
						>
					{/if}
				</Button>
			{/if}
		</header>
		<main class="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
