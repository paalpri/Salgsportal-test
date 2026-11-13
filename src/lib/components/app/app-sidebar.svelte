<script lang="ts">
	import { page } from '$app/state';
	import { modules } from '#lib/modules.ts';
	import { initials } from '#lib/format.ts';
	import Logo from './logo.svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { toggleMode, mode } from 'mode-watcher';
	import House from '@lucide/svelte/icons/house';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import FileText from '@lucide/svelte/icons/file-text';
	import Package from '@lucide/svelte/icons/package';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Users from '@lucide/svelte/icons/users';
	import Landmark from '@lucide/svelte/icons/landmark';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import UserIcon from '@lucide/svelte/icons/user';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import LogOut from '@lucide/svelte/icons/log-out';

	type Props = { user: { name: string; email: string; isAdmin: boolean } | null };
	let { user }: Props = $props();

	const adminLinks = [
		{ href: '/admin', label: 'Oversikt', icon: LayoutDashboard },
		{ href: '/admin/forside', label: 'Forside', icon: PanelsTopLeft },
		{ href: '/admin/innlegg', label: 'Nyheter og kampanjer', icon: FileText },
		{ href: '/admin/produkter', label: 'Moduler og priser', icon: Package },
		{ href: '/admin/kurs', label: 'Kurskalender', icon: CalendarDays },
		{ href: '/admin/onsker', label: 'Ønsker fra kommunene', icon: Lightbulb },
		{ href: '/admin/brukere', label: 'Brukere', icon: Users },
		{ href: '/admin/kommuner', label: 'Kommuner', icon: Landmark }
	];

	const within = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	const isActive = (href: string) =>
		href === '/' || href === '/admin' ? page.url.pathname === href : within(href);

	const item = 'h-9 data-active:shadow-[inset_3px_0_0_var(--coral)]';
	let logoutForm = $state<HTMLFormElement>();
</script>

{#snippet link(href: string, label: string, Icon: typeof House)}
	<Sidebar.MenuButton isActive={isActive(href)} tooltipContent={label} class={item}>
		{#snippet child({ props })}
			<a {href} {...props}><Icon /><span>{label}</span></a>
		{/snippet}
	</Sidebar.MenuButton>
{/snippet}

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="px-3 pt-4 pb-2">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="hover:bg-transparent active:bg-transparent">
					{#snippet child({ props })}
						<a href="/" {...props}><Logo inverted class="text-white" /></a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content class="px-1">
		<Sidebar.Group>
			<Sidebar.Menu>
				<Sidebar.MenuItem>{@render link('/', 'Hjem', House)}</Sidebar.MenuItem>
				{#each modules as m (m.href)}
					<Sidebar.MenuItem>{@render link(m.href, m.label, m.icon)}</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		{#if user?.isAdmin}
			<Sidebar.Group>
				<Sidebar.GroupLabel class="text-sidebar-foreground/60">Administrasjon</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each adminLinks as l (l.href)}
						<Sidebar.MenuItem>{@render link(l.href, l.label, l.icon)}</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	{#if user && (within('/admin') || within('/profil'))}
		<Sidebar.Footer class="border-t border-sidebar-border p-3">
			<form method="post" action="/logg-ut" bind:this={logoutForm} class="hidden"></form>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton size="lg" {...props}>
									<span
										class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-white/10 text-xs font-semibold text-white"
									>
										{initials(user.name)}
									</span>
									<div class="grid flex-1 text-left text-sm leading-tight">
										<span class="truncate font-medium text-white">{user.name}</span>
										<span class="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
									</div>
									<ChevronsUpDown class="ml-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-60" side="top" align="start">
							<DropdownMenu.Label class="font-normal">
								<p class="truncate font-medium">{user.name}</p>
								<p class="truncate text-xs text-muted-foreground">{user.email}</p>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								{#snippet child({ props })}
									<a href="/profil" {...props}><UserIcon /> Min profil</a>
								{/snippet}
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={toggleMode}>
								{#if mode.current === 'dark'}<Sun /> Lyst tema{:else}<Moon /> Mørkt tema{/if}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={() => logoutForm?.requestSubmit()}>
								<LogOut /> Logg ut
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	{/if}
	<Sidebar.Rail />
</Sidebar.Root>
