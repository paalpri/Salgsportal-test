import { db } from './db/index.ts';
import { moduleSetting } from './db/schema.ts';
import { modules, type ModuleKey } from '#lib/modules.ts';

/** Modules without a stored setting are enabled. */
export async function enabledModuleKeys(): Promise<ModuleKey[]> {
	const rows = await db.select().from(moduleSetting);
	const disabled = new Set(rows.filter((r) => !r.enabled).map((r) => r.key));
	return modules.filter((m) => !disabled.has(m.key)).map((m) => m.key);
}
