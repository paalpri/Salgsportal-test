import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'Passord123!';
export const ADMIN = 'admin@kommuneportalen.no';
export const MEMBER = 'kari.nordmann@bergen.kommune.no';

export async function login(page: Page, email: string, password = PASSWORD) {
	await open(page, '/logg-inn');
	await page.getByLabel('E-post').fill(email);
	await page.getByLabel('Passord').fill(password);
	await page.getByRole('button', { name: 'Logg inn' }).click();
	await expect(page).toHaveURL('/');
}

export async function pick(page: Page, trigger: string, option: string) {
	await page.getByRole('combobox', { name: trigger }).click();
	await page.getByRole('option', { name: option, exact: true }).click();
}

export const unique = (label: string) => `${label} ${Date.now().toString(36)}`;

/** Navigate and wait for hydration, so form submits go through use:enhance rather than a full reload. */
export async function open(page: Page, path: string) {
	await page.goto(path);
	await page.waitForLoadState('networkidle');
}
