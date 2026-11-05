import { expect, test } from '@playwright/test';
import { ADMIN, MEMBER, login, open, pick, unique } from './helpers.ts';

test('anonymous visitors are sent to login and back after signing in', async ({ page }) => {
	await open(page, '/forum');
	await expect(page).toHaveURL('/logg-inn?redirectTo=%2Fforum');
	await page.getByLabel('E-post').fill(MEMBER);
	await page.getByLabel('Passord').fill('feil-passord');
	await page.getByRole('button', { name: 'Logg inn' }).click();
	await expect(page.getByText('Feil e-post eller passord.')).toBeVisible();

	await page.getByLabel('Passord').fill('Passord123!');
	await page.getByRole('button', { name: 'Logg inn' }).click();
	await expect(page).toHaveURL('/forum');
	await expect(page.getByRole('heading', { name: 'Forum', exact: true })).toBeVisible();
});

test('registration enforces the kommune email domain', async ({ page }) => {
	const email = `${Date.now().toString(36)}@bodo.kommune.no`;
	await open(page, '/registrer');
	await page.getByLabel('Navn').fill('Test Testesen');
	await pick(page, 'Kommune', 'Bodø');
	await page.getByLabel('E-post').fill('privat@example.com');
	await page.getByLabel('Passord').fill('Passord123!');
	await page.getByRole('button', { name: 'Opprett konto' }).click();
	await expect(
		page.getByText('Bruk e-postadressen din fra Bodø (@bodo.kommune.no).')
	).toBeVisible();

	await page.getByLabel('E-post').fill(email);
	await page.getByLabel('Passord').fill('Passord123!');
	await page.getByRole('button', { name: 'Opprett konto' }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Velkommen tilbake til portalen for Bodø.')).toBeVisible();
});

test('members can start a thread, get a reply and mark it as the solution', async ({
	page,
	browser
}) => {
	const title = unique('Hvordan eksporterer dere statistikk?');
	await login(page, MEMBER);
	await open(page, '/forum');
	await page.getByRole('link', { name: 'Nytt innlegg' }).first().click();
	await page.waitForLoadState('networkidle');
	await pick(page, 'Kategori', 'Spørsmål og svar');
	await page.getByLabel('Tittel').fill(title);
	await page.getByLabel('Innhold').fill('Vi trenger tall per kvartal.');
	await page.getByRole('button', { name: 'Publiser' }).click();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	const threadUrl = page.url();

	const other = await browser.newPage();
	await login(other, 'ola.hansen@tromso.kommune.no');
	await open(other, threadUrl);
	await other.getByLabel('Skriv et svar').fill('Bruk rapportmodulen, eksporter til Excel.');
	await other.getByRole('button', { name: 'Svar', exact: true }).click();
	await expect(other.getByText('Bruk rapportmodulen, eksporter til Excel.')).toBeVisible();
	await expect(other.getByRole('button', { name: 'Marker som løsning' })).toHaveCount(0);
	await other.close();

	await page.reload();
	await page.getByRole('button', { name: 'Marker som løsning' }).click();
	await expect(page.getByText('Løsning', { exact: true })).toBeVisible();

	await open(page, '/forum');
	await expect(page.getByRole('link', { name: title })).toContainText('Løst');
});

test('shopping list flows from member request to admin answer', async ({ page, browser }) => {
	await login(page, MEMBER);
	await open(page, '/produkter/superbrukerkurs');
	await page.getByLabel('Antall').fill('3');
	await page.getByRole('button', { name: 'Legg i handlelisten' }).click();
	await expect(page.getByRole('link', { name: '3 i handlelisten' })).toBeVisible();

	await open(page, '/handleliste');
	await expect(page.getByRole('link', { name: 'Superbrukerkurs' })).toBeVisible();
	const message = unique('Gjerne i mars');
	await page.getByPlaceholder('Melding til oss (valgfritt)').fill(message);
	await page.getByRole('button', { name: 'Send forespørsel' }).click();
	await expect(page.getByText('Handlelisten er tom')).toBeVisible();
	await expect(page.getByText(`«${message}»`)).toBeVisible();

	const admin = await browser.newPage();
	await login(admin, ADMIN);
	await open(admin, '/admin/foresporsler?status=new');
	await admin
		.getByRole('link', { name: /Bergen/ })
		.first()
		.click();
	await expect(admin.getByText(message)).toBeVisible();
	await pick(admin, 'Status', 'Besvart');
	await admin.getByLabel('Svar til kommunen').fill('Tilbud er sendt på e-post.');
	await admin.getByRole('button', { name: 'Lagre' }).click();
	await expect(admin.getByText('Lagret')).toBeVisible();
	await admin.close();

	await page.reload();
	const request = page.locator('li', { hasText: message });
	await expect(request.getByText('Besvart')).toBeVisible();
	await expect(request.getByText('Svar: Tilbud er sendt på e-post.')).toBeVisible();
});

test('admin publishes a campaign that members see on the dashboard', async ({ page, browser }) => {
	const title = unique('Vinterkampanje');
	await login(page, ADMIN);
	await open(page, '/admin/innlegg/ny');
	await pick(page, 'Type', 'Kampanje / annonse');
	await page.getByLabel('Tittel').fill(title);
	await page.getByLabel('Ingress').fill('Halv pris på kurs i januar.');
	await page.getByLabel('Knappelenke').fill('/produkter');
	await page.getByLabel('Publisert').click();
	await page.getByLabel('Fest øverst').click();
	await page.getByRole('button', { name: 'Opprett' }).click();
	await expect(page).toHaveURL(/\/admin\/innlegg\/\d+$/);

	const member = await browser.newPage();
	await login(member, MEMBER);
	await expect(member.getByRole('heading', { name: title })).toBeVisible();
	await member.close();

	await page.getByRole('button', { name: 'Slett' }).click();
	await page.getByRole('alertdialog').getByRole('button', { name: 'Slett' }).click();
	await expect(page).toHaveURL('/admin/innlegg');
	await expect(page.getByText(title)).toHaveCount(0);
});

test('admin can switch a module off for members', async ({ page, browser }) => {
	await login(page, ADMIN);
	await open(page, '/admin/moduler');
	const forumSwitch = page.getByRole('switch', { name: /Forum/ });
	await forumSwitch.click();
	await expect(forumSwitch).not.toBeChecked();

	const member = await browser.newPage();
	try {
		await login(member, MEMBER);
		await expect(member.getByRole('link', { name: 'Forum' })).toHaveCount(0);
		const response = await member.goto('/forum');
		expect(response?.status()).toBe(404);
	} finally {
		await member.close();
		await forumSwitch.click();
		await expect(forumSwitch).toBeChecked();
	}
});

test('members cannot reach admin pages', async ({ page }) => {
	await login(page, MEMBER);
	const response = await page.goto('/admin');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('link', { name: 'Brukere' })).toHaveCount(0);
});

test('sign-up is only possible through the registration form', async ({ request, baseURL }) => {
	const response = await request.post('/api/auth/sign-up/email', {
		headers: { Origin: baseURL! },
		data: { email: 'bypass@example.com', password: 'Passord123!', name: 'Bypass' }
	});
	expect(response.status()).toBe(404);
});
