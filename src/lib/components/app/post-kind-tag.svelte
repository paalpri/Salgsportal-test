<script lang="ts">
	import { postKinds, type PostKind } from '#lib/post-kinds.ts';
	import { cn } from '#lib/utils.ts';

	let { kind, class: className = '' }: { kind: PostKind; class?: string } = $props();

	const styles: Record<PostKind, string> = {
		release: 'bg-brand text-white',
		news: 'bg-secondary text-secondary-foreground',
		ad: 'bg-coral text-ink'
	};
</script>

<span
	class={cn('inline-block rounded-sm px-1.5 py-0.5 text-xs font-semibold', styles[kind], className)}
>
	{postKinds[kind].label}
</span>
