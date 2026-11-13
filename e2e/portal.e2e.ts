import { expect, test } from '@playwright/test';
import { ADMIN, login, open, pick, unique } from './helpers.ts';

test('visitors browse the portal without logging in', async ({ page }) => {
	await open(page, '/');
	await expect(page.getByRole('heading', { name: 'Velkommen til Kommuneportalen' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Modulus Barn i tall' })).toBeVisible();
	await expect(page.getByText('kommuner bruker Modulus Barn')).toBeVisible();
	await expect(page.getByRole('link', { name: /Del et ønske/ })).toHaveAttribute('href', '/onsker');
	await expect(page.getByText('Driftsmelding')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Forum' })).toHaveCount(0);
	await expect(page.getByText('Administrasjon')).toHaveCount(0);

	await page.getByRole('link', { name: /Se nyheter/ }).click();
	await expect(page.getByRole('heading', { name: 'Nyheter og aktuelt' })).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Driftsmeldinger' })).toHaveCount(0);
});

test('admin pages send visitors to login and back after signing in', async ({ page }) => {
	await open(page, '/admin');
	await expect(page).toHaveURL('/logg-inn?redirectTo=%2Fadmin');
	await page.getByLabel('E-post').fill(ADMIN);
	await page.getByLabel('Passord').fill('feil-passord');
	await page.getByRole('button', { name: 'Logg inn' }).click();
	await expect(page.getByText('Feil e-post eller passord.')).toBeVisible();

	await page.getByLabel('Passord').fill('Passord123!');
	await page.getByRole('button', { name: 'Logg inn' }).click();
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('heading', { name: 'Administrasjon', exact: true })).toBeVisible();

	await page.getByRole('button', { name: /Ingrid Solberg/ }).click();
	await page.getByRole('menuitem', { name: 'Logg ut' }).click();
	await expect(page).toHaveURL('/logg-inn');
});

test('admin publishes a campaign that visitors see on the front page', async ({
	page,
	browser
}) => {
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

	const visitor = await browser.newPage();
	await open(visitor, '/');
	await expect(visitor.getByRole('heading', { name: title })).toBeVisible();
	await visitor.close();

	await page.getByRole('button', { name: 'Slett' }).click();
	await page.getByRole('alertdialog').getByRole('button', { name: 'Slett' }).click();
	await expect(page).toHaveURL('/admin/innlegg');
	await expect(page.getByText(title)).toHaveCount(0);
});

test('sign-up through the auth API is closed', async ({ request, baseURL }) => {
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

test('admin edits the welcome section that every visitor sees', async ({ page, browser }) => {
	const title = unique('Velkommen, kommuner');
	const figure = unique('158');
	await login(page, ADMIN);
	await open(page, '/admin/forside');
	await page.getByLabel('Overskrift').fill(title);
	await page.getByLabel('Nøkkeltall 1, tall').fill(figure);
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await page.getByRole('button', { name: 'Lagre forsiden' }).click();
	await expect(page.getByText('Forsiden er oppdatert')).toBeVisible();

	const visitor = await browser.newPage();
	await open(visitor, '/');
	await expect(visitor.getByRole('heading', { name: title })).toBeVisible();
	await expect(visitor.getByText(figure)).toBeVisible();
	await expect(visitor.getByRole('link', { name: 'Rediger forsiden' })).toHaveCount(0);
	await open(visitor, '/admin/forside');
	await expect(visitor).toHaveURL('/logg-inn?redirectTo=%2Fadmin%2Fforside');
	await visitor.close();

	await page.getByRole('button', { name: 'Gjenopprett standardtekst' }).click();
	await expect(page.getByLabel('Overskrift')).toHaveValue('Velkommen til Kommuneportalen');
});

test('services show their price list and lead to the ordering guide', async ({ page }) => {
	await open(page, '/produkter/e-laering');
	await expect(page.getByRole('heading', { name: 'Priser' })).toBeVisible();
	await expect(page.getByText('201–500 ansatte')).toBeVisible();
	await expect(page.getByText('60 000 kr/år')).toBeVisible();
	await page.getByRole('link', { name: 'Til bestilling' }).click();
	await expect(page).toHaveURL('/produkter#bestilling');
	await expect(page.getByRole('heading', { name: 'Slik bestiller dere' })).toBeVisible();
});

test('admin edits the price list and order link that visitors see', async ({ page }) => {
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

test('admin schedules a course date that visitors open in the calendar', async ({
	page,
	browser
}) => {
	await login(page, ADMIN);
	await open(page, '/admin/kurs');
	await page.getByRole('link', { name: 'Jobb smartere i Modulus Barn' }).click();
	await page.waitForLoadState('networkidle');
	const form = page.getByRole('form', { name: 'Ny kursdato' });
	await form.getByLabel('Dato').fill('2030-03-12');
	await form.getByLabel('Start').fill('12:30');
	await form.getByLabel('Slutt').fill('14:30');
	await form.getByLabel('Maks deltakere').fill('25');
	await form.getByLabel('Påmeldingslenke').fill('https://pamelding.example.no/smartere');
	await page.getByRole('button', { name: 'Legg til' }).click();
	await expect(page.getByText('Kursdatoen er lagt til')).toBeVisible();

	const visitor = await browser.newPage();
	await open(visitor, '/kurskalender?maned=2030-03');
	await visitor.getByRole('button', { name: /Jobb smartere i Modulus Barn/ }).click();
	const dialog = visitor.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Jobb smartere i Modulus Barn' })).toBeVisible();
	await expect(dialog.getByText(/12\. mars 2030, kl\. 12:30–14:30/)).toBeVisible();
	await expect(dialog.getByText('2 timer')).toBeVisible();
	await expect(dialog.getByText('Inntil 25 deltakere')).toBeVisible();
	const signup = dialog.getByRole('link', { name: 'Meld på kursdeltaker' });
	await expect(signup).toHaveAttribute('href', 'https://pamelding.example.no/smartere');
	await expect(signup).toHaveAttribute('target', '_blank');
	await expect(dialog.getByText('Påmeldingen gjennomføres på en ekstern side.')).toBeVisible();

	await visitor.keyboard.press('Escape');
	await visitor.getByRole('link', { name: 'Forrige måned' }).click();
	await expect(visitor).toHaveURL('/kurskalender?maned=2030-02');
	await expect(visitor.getByText(/ingen planlagte kurs i denne perioden/)).toBeVisible();
	await visitor.close();
});

test('visitors send wishes that only admins see', async ({ page, browser }) => {
	const title = unique('Ønske om bedre søk i dokumenter');
	await open(page, '/onsker');
	await page.getByLabel('Hva ønsker dere?').fill(title);
	await page
		.getByLabel('Beskrivelse')
		.fill('Vi vil kunne søke i innholdet i dokumentene, ikke bare titlene.');
	await pick(page, 'Kategori', 'Saksbehandling og arbeidsflyt');
	await pick(page, 'Kommune', 'Tromsø');
	await page.getByRole('button', { name: 'Send ønsket' }).click();
	await expect(page.getByText('Takk! Ønsket er sendt')).toBeVisible();
	await expect(page.getByLabel('Hva ønsker dere?')).toHaveValue('');
	await expect(page.getByText(title)).toHaveCount(0);

	const admin = await browser.newPage();
	await login(admin, ADMIN);
	await open(admin, '/admin/onsker');
	await admin.getByRole('link', { name: /Saksbehandling og arbeidsflyt/ }).click();
	await expect(
		admin.getByRole('link', { name: 'Kopiere tiltaksplan fra forrige periode' })
	).toHaveCount(0);
	await expect(admin.getByRole('row', { name: new RegExp(title) })).toContainText('Tromsø');
	await admin.getByRole('link', { name: title }).click();
	await admin.waitForLoadState('networkidle');
	await pick(admin, 'Status', 'Planlagt');
	await admin.getByLabel('Notat').fill('Dette kommer i neste versjon.');
	await admin.getByRole('button', { name: 'Lagre' }).click();
	await expect(admin.getByText('Lagret')).toBeVisible();
	await admin.close();
});
