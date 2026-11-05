import { error } from '@sveltejs/kit';
import { modules } from '#lib/modules.ts';
import { db } from '#lib/server/db/index.ts';
import { moduleSetting } from '#lib/server/db/schema.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const key = String(form.get('key'));
		if (!modules.some((m) => m.key === key)) error(400, 'Ukjent modul');
		const enabled = form.get('enabled') === 'on';

		await db
			.insert(moduleSetting)
			.values({ key, enabled })
			.onConflictDoUpdate({ target: moduleSetting.key, set: { enabled } });
		return { key, enabled };
	}
};
