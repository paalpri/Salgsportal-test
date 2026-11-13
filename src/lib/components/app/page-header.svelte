<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { title: string; description?: string; eyebrow?: string; actions?: Snippet };
	let { title, description, eyebrow, actions }: Props = $props();
</script>

<div class="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
	<div class="max-w-3xl space-y-2">
		{#if eyebrow}<p class="text-sm text-muted-foreground">{eyebrow}</p>{/if}
		<h1 class="text-3xl font-normal md:text-4xl">{title}</h1>
		{#if description}<p class="text-base text-muted-foreground md:text-lg">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 flex-wrap gap-2">{@render actions()}</div>{/if}
</div>
