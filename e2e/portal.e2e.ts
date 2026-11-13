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
	await expect(
		page.getByRole('heading', { name: 'Kommuneportalen for Modulus Barn' })
	).toBeVisible();
	await expect(page.getByText('Hei, Test')).toBeVisible();
});

test('members can start a thread, get a reply and mark it as the solution', async ({
	page,
	browser
}) => {
	const title = unique('Hvordan eksporterer dere statistikk?');
	await login(page, MEMBER);
	await open(page, '/forum');
	await page.getByRole('link', { name: 'Nytt innlegg' }).first().click();
	await expect(page).toHaveURL('/forum/ny');
	await pick(page, 'Kategori', 'Bruk og arbeidsflyt');
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

test('admin publishes a campaign that members see on the dashboard', async ({ page, browser }) => {
	const title = unique('Vinterkampanje');
	await login(page, ADMIN);
	await open(page, '/admin/innlegg/ny');
	await pick(page, 'Type', 'Kampanje');
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

test('test users on the login page fill in the form', async ({ page }) => {
	await open(page, '/logg-inn');
	await page
		.getByRole('link', { name: /Administrator/ })
		.first()
		.click();
	await expect(page.getByLabel('E-post')).toHaveValue(ADMIN);
	await expect(page.getByRole('button', { name: 'Logg inn' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Administrasjon')).toBeVisible();
});

test('admin edits the welcome section that every member sees', async ({ page, browser }) => {
	const title = unique('Velkommen, kommuner');
	await login(page, ADMIN);
	await open(page, '/admin/forside');
	await page.getByLabel('Overskrift').fill(title);
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await page.getByRole('button', { name: 'Lagre forsiden' }).click();
	await expect(page.getByText('Forsiden er oppdatert')).toBeVisible();

	const member = await browser.newPage();
	await login(member, MEMBER);
	await expect(member.getByRole('heading', { name: title })).toBeVisible();
	await expect(member.getByRole('link', { name: 'Rediger forsiden' })).toHaveCount(0);
	expect((await member.goto('/admin/forside'))?.status()).toBe(404);
	await member.close();

	await page.getByRole('button', { name: 'Gjenopprett standardtekst' }).click();
	await expect(page.getByLabel('Overskrift')).toHaveValue('Kommuneportalen for Modulus Barn');
});

test('front page shows the current driftsmelding and key figures', async ({ page }) => {
	await login(page, MEMBER);
	await expect(page.getByText('Driftsmelding:')).toBeVisible();
	await expect(page.getByRole('link', { name: /Planlagt vedlikehold/ })).toBeVisible();
	await expect(page.getByText('kommuner bruker Modulus Barn')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Nytt i Modulus Barn' })).toBeVisible();
});

test('services show their price list and lead to the ordering guide', async ({ page }) => {
	await login(page, MEMBER);
	await open(page, '/produkter/e-laering');
	await expect(page.getByRole('heading', { name: 'Priser' })).toBeVisible();
	await expect(page.getByText('201–500 ansatte')).toBeVisible();
	await expect(page.getByText('60 000 kr/år')).toBeVisible();
	await page.getByRole('link', { name: 'Til bestilling' }).click();
	await expect(page).toHaveURL('/produkter#bestilling');
	await expect(page.getByRole('heading', { name: 'Slik bestiller dere' })).toBeVisible();
});

test('admin edits the price list and order link that members see', async ({ page }) => {
	await login(page, ADMIN);
	await open(page, '/admin/produkter');
	await page.getByRole('link', { name: 'Arbeidsmøte', exact: true }).click();
	await page.waitForLoadState('networkidle');
	await page.getByLabel('Prisliste').fill('Timebasert\nInntil 5 timer | 9 999 kr');
	await page.getByLabel('Lenke til bestilling').fill('https://toolkit.example.no/arbeidsmote');
	await page.getByRole('button', { name: 'Lagre' }).click();
	await expect(page.getByText('Lagret')).toBeVisible();

	await open(page, '/produkter/arbeidsmote');
	await expect(page.getByText('Inntil 5 timer')).toBeVisible();
	await expect(page.getByText('9 999 kr')).toBeVisible();
	const order = page.getByRole('link', { name: 'Til bestilling' });
	await expect(order).toHaveAttribute('href', 'https://toolkit.example.no/arbeidsmote');
	await expect(order).toHaveAttribute('target', '_blank');
});

test('wishes are private to the author and visible to admins by category', async ({
	page,
	browser
}) => {
	const title = unique('Ønske om bedre søk i dokumenter');
	await login(page, MEMBER);
	await open(page, '/onsker');
	await page.getByLabel('Hva ønsker dere?').fill(title);
	await page
		.getByLabel('Beskrivelse')
		.fill('Vi vil kunne søke i innholdet i dokumentene, ikke bare titlene.');
	await pick(page, 'Kategori', 'Saksbehandling og arbeidsflyt');
	await page.getByRole('button', { name: 'Send ønsket' }).click();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await expect(page.getByText('Mottatt').first()).toBeVisible();

	const other = await browser.newPage();
	await login(other, 'ola.hansen@tromso.kommune.no');
	await open(other, '/onsker');
	await expect(other.getByText(title)).toHaveCount(0);
	await expect(other.getByText('Samlet oversikt over samværsavtaler')).toHaveCount(0);
	await other.close();

	const admin = await browser.newPage();
	await login(admin, ADMIN);
	await open(admin, '/admin/onsker');
	await admin.getByRole('link', { name: /Saksbehandling og arbeidsflyt/ }).click();
	await expect(
		admin.getByRole('link', { name: 'Kopiere tiltaksplan fra forrige periode' })
	).toHaveCount(0);
	await admin.getByRole('link', { name: title }).click();
	await admin.waitForLoadState('networkidle');
	await pick(admin, 'Status', 'Planlagt');
	await admin.getByLabel('Svar til innsenderen').fill('Dette kommer i neste versjon.');
	await admin.getByRole('button', { name: 'Lagre' }).click();
	await expect(admin.getByText('Lagret')).toBeVisible();
	await admin.close();

	await page.reload();
	const card = page.locator('li', { hasText: title });
	await expect(card.getByText('Planlagt')).toBeVisible();
	await expect(card.getByText('Dette kommer i neste versjon.')).toBeVisible();
	await expect(card.getByRole('button', { name: 'Trekk tilbake' })).toHaveCount(0);
});
