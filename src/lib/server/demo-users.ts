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
	},
	{
		key: 'leder',
		email: 'kari.nordmann@bergen.kommune.no',
		name: 'Kari Nordmann',
		label: 'Barnevernleder',
		description: 'Bergen kommune. Har sendt inn ønsker.'
	},
	{
		key: 'saksbehandler',
		email: 'ola.hansen@tromso.kommune.no',
		name: 'Ola Hansen',
		label: 'Saksbehandler',
		description: 'Tromsø kommune. Spør og svarer i forumet.'
	},
	{
		key: 'systemansvarlig',
		email: 'jonas.lie@bodo.kommune.no',
		name: 'Jonas Lie',
		label: 'Fagsystemansvarlig',
		description: 'Bodø kommune. Starter med Modulus Barn i januar.'
	}
] as const;

export const demoLoginEnabled = dev || DEMO_LOGIN;
