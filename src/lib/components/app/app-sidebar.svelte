<script lang="ts">
	import { page } from '$app/state';
	import { modules, type ModuleKey } from '#lib/modules.ts';
	import { initials } from '#lib/format.ts';
	import Logo from './logo.svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { toggleMode, mode } from 'mode-watcher';
	import House from '@lucide/svelte/icons/house';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import FileText from '@lucide/svelte/icons/file-text';
	import Package from '@lucide/svelte/icons/package';
	import MessagesSquare from '@lucide/svelte/icons/messages-square';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Users from '@lucide/svelte/icons/users';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Blocks from '@lucide/svelte/icons/blocks';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import UserIcon from '@lucide/svelte/icons/user';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import LogOut from '@lucide/svelte/icons/log-out';

	type Props = {
		user: { name: string; email: string; isAdmin: boolean; municipalityName: string | null };
		enabled: ModuleKey[];
		cartCount: number;
	};
	let { user, enabled, cartCount }: Props = $props();

	const adminLinks = [
		{ href: '/admin', label: 'Oversikt', icon: LayoutDashboard },
		{ href: '/admin/innlegg', label: 'Nyheter og annonser', icon: FileText },
		{ href: '/admin/produkter', label: 'Produkter', icon: Package },
		{ href: '/admin/forum', label: 'Forumkategorier', icon: MessagesSquare },
		{ href: '/admin/foresporsler', label: 'Forespørsler', icon: Inbox },
		{ href: '/admin/brukere', label: 'Brukere', icon: Users },
		{ href: '/admin/kommuner', label: 'Kommuner', icon: Landmark },
		{ href: '/admin/moduler', label: 'Moduler', icon: Blocks }
	];

	const visibleModules = $derived(modules.filter((m) => enabled.includes(m.key)));
	const isActive = (href: string) =>
		href === '/' || href === '/admin'
			? page.url.pathname === href
			: page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	let logoutForm: HTMLFormElement;
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}><Logo /></a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>{user.municipalityName ?? 'Portal'}</Sidebar.GroupLabel>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive('/')} tooltipContent="Hjem">
						{#snippet child({ props })}
							<a href="/" {...props}><House /><span>Hjem</span></a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
				{#each visibleModules as m (m.key)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={isActive(m.href)} tooltipContent={m.label}>
							{#snippet child({ props })}
								<a href={m.href} {...props}><m.icon /><span>{m.label}</span></a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if m.key === 'cart' && cartCount > 0}
							<Sidebar.MenuBadge>{cartCount}</Sidebar.MenuBadge>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		{#if user.isAdmin}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Administrasjon</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each adminLinks as link (link.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(link.href)} tooltipContent={link.label}>
								{#snippet child({ props })}
									<a href={link.href} {...props}><link.icon /><span>{link.label}</span></a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer>
		<form method="post" action="/logg-ut" bind:this={logoutForm} class="hidden"></form>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton size="lg" {...props}>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-primary/10 text-primary">
										{initials(user.name)}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs text-muted-foreground">{user.email}</span>
								</div>
								<ChevronsUpDown class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" side="top" align="start">
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
						<DropdownMenu.Item onSelect={() => logoutForm.requestSubmit()}>
							<LogOut /> Logg ut
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
