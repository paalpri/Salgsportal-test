import type { SubmitFunction } from '$app/forms';
import { toast } from 'svelte-sonner';

/**
 * Keeps the user on the current page and reports the outcome as a toast. Redirects are still followed;
 * `navigate: false` stops SvelteKit from moving to the action's own route (e.g. /produkter?/addToCart).
 */
export function withToast(
	success?: string,
	{ reset = true, onSuccess }: { reset?: boolean; onSuccess?: () => void } = {}
): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			await update({ reset, navigate: false });
			if (result.type === 'success' || result.type === 'redirect') {
				if (success) toast.success(success);
				onSuccess?.();
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Noe gikk galt'));
			} else if (result.type === 'error') {
				toast.error(result.error?.message ?? 'Noe gikk galt');
			}
		};
}
