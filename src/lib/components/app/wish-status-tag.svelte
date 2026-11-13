<script lang="ts">
	import { wishStatuses, type WishStatus } from '#lib/wish-status.ts';
	import { cn } from '#lib/utils.ts';

	let { status }: { status: WishStatus } = $props();
</script>

<span
	class={cn(
		'inline-block shrink-0 rounded-sm px-1.5 py-0.5 text-xs font-semibold',
		wishStatuses[status].className
	)}
>
	{wishStatuses[status].label}
</span>
