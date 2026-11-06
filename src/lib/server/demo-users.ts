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
		description: 'Netcompany. Redigerer forside, produkter, priser og innlegg.'
	},
	{
		key: 'leder',
		email: 'kari.nordmann@bergen.kommune.no',
		name: 'Kari Nordmann',
		label: 'Barnevernleder',
		description: 'Bergen kommune. Har varer i handlelisten.'
	},
	{
		key: 'saksbehandler',
		email: 'ola.hansen@tromso.kommune.no',
		name: 'Ola Hansen',
		label: 'Saksbehandler',
		description: 'Tromsø kommune. Aktiv i forumet.'
	},
	{
		key: 'systemansvarlig',
		email: 'jonas.lie@bodo.kommune.no',
		name: 'Jonas Lie',
		label: 'Systemansvarlig',
		description: 'Bodø kommune. Integrasjoner og oppsett.'
	}
] as const;

export const demoLoginEnabled = dev || DEMO_LOGIN;
