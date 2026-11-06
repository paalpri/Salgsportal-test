<script lang="ts">
	import { Button, type ButtonSize } from '#lib/components/ui/button/index.js';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	type Props = { url: string | null; size?: ButtonSize; class?: string };
	let { url, size = 'sm', class: className = '' }: Props = $props();
	const external = $derived(!!url && /^https?:\/\//.test(url));
</script>

{#if url}
	<Button
		href={url}
		{size}
		class={className}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
	>
		Til bestilling
		{#if external}<ExternalLink />{:else}<ArrowRight />{/if}
	</Button>
{:else}
	<span class="text-sm text-muted-foreground">Kontakt oss for mer informasjon</span>
{/if}
