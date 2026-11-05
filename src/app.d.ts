import type { auth } from '#lib/server/auth.ts';
import type { ModuleKey } from '#lib/modules.ts';

type SessionData = typeof auth.$Infer.Session;

declare global {
	namespace App {
		interface Locals {
			user?: SessionData['user'];
			session?: SessionData['session'];
			modules: ModuleKey[];
		}
	}
}

export {};
