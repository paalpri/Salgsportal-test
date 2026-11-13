import { dev } from '$app/env';
import { DEMO_LOGIN } from '$app/env/private';

export const DEMO_PASSWORD = 'Passord123!';

/** Seeded users offered as one-click logins on /logg-inn while testing. */
export const demoUsers = [
	{
		key: 'admin',
		email: 'admin@kommuneportalen.no',
		name: 'Ingrid Solberg',
		label: 'Administrator',
		description: 'Netcompany. Redigerer forside, moduler, priser og nyheter.'
	}
] as const;

export const demoLoginEnabled = dev || DEMO_LOGIN;
