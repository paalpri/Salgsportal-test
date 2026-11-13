import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import * as s from '../src/lib/server/db/schema.ts';
import { parsePriceList } from '../src/lib/prices.ts';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema: s, casing: 'snake_case' });

const DEMO_PASSWORD = 'Passord123!';
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
	const existing = await db.select({ id: s.user.id }).from(s.user).limit(1);
	if (existing.length) {
		console.log('Database already has users; skipping seed. Use `pnpm db:reset` to start over.');
		return;
	}

	const kommuner = await db
		.insert(s.municipality)
		.values(
			[
				['Oslo', '0301', 'Oslo'],
				['Bergen', '4601', 'Vestland'],
				['Trondheim', '5001', 'Trøndelag'],
				['Stavanger', '1103', 'Rogaland'],
				['Kristiansand', '4204', 'Agder'],
				['Tromsø', '5501', 'Troms'],
				['Bodø', '1804', 'Nordland'],
				['Ålesund', '1508', 'Møre og Romsdal'],
				['Drammen', '3301', 'Buskerud'],
				['Lillehammer', '3405', 'Innlandet'],
				['Fredrikstad', '3107', 'Østfold'],
				['Tønsberg', '3905', 'Vestfold']
			].map(([name, number, county]) => ({ name, number, county }))
		)
		.returning();
	const k = Object.fromEntries(kommuner.map((m) => [m.name, m.id]));

	const password = await hashPassword(DEMO_PASSWORD);
	const people = [
		{
			key: 'admin',
			name: 'Ingrid Solberg',
			email: 'admin@kommuneportalen.no',
			role: 'admin',
			municipalityId: null,
			jobTitle: 'Kundeansvarlig, Netcompany'
		}
	];
	const users = await db
		.insert(s.user)
		.values(
			people.map((p) => ({
				name: p.name,
				email: p.email,
				role: p.role,
				municipalityId: p.municipalityId,
				jobTitle: p.jobTitle,
				id: crypto.randomUUID(),
				emailVerified: true
			}))
		)
		.returning();
	await db.insert(s.account).values(
		users.map((u) => ({
			id: crypto.randomUUID(),
			accountId: u.id,
			providerId: 'credential',
			userId: u.id,
			password,
			createdAt: new Date(),
			updatedAt: new Date()
		}))
	);
	const u = Object.fromEntries(people.map((p, i) => [p.key, users[i].id]));

	const paragraphs = (...parts: string[]) => parts.join('\n\n');
	const list = (title: string, items: string[]) =>
		[title, ...items.map((item) => `• ${item}`)].join('\n');
	const prices = (...lines: string[]) => parsePriceList(lines.join('\n'));

	const productCategories = await db
		.insert(s.productCategory)
		.values([
			{
				name: 'Rådgivning og opplæring',
				slug: 'radgivning-og-opplaering',
				description: 'Rådgivning og kurs som styrker kommunens kompetanse i Modulus Barn.',
				sortOrder: 1
			},
			{
				name: 'Arbeidsmøter',
				slug: 'arbeidsmoter',
				description: 'Behovstilpassede møter med fageksperter fra Netcompany.',
				sortOrder: 2
			},
			{
				name: 'Integrasjonsstøtte',
				slug: 'integrasjonsstotte',
				description: 'Integrasjoner og tillegg som Netcompany setter opp for kommunen.',
				sortOrder: 3
			},
			{
				name: 'Migreringsstøtte',
				slug: 'migreringsstotte',
				description: 'Overføring av data fra kommunens tidligere fagsystem.',
				sortOrder: 4
			}
		])
		.returning();
	const pc = Object.fromEntries(productCategories.map((cat) => [cat.slug, cat.id]));

	const courseModules = [
		'Introduksjon til Modulus Barn',
		'Aktiviteter og hendelser',
		'Bekymringsmeldinger',
		'Undersøkelse',
		'Tiltak',
		'Oppfølgingsbesøk og tilsynsbesøk',
		'Planer og evaluering',
		'Opprettelse av aktører og organisasjoner',
		'Dokumenthåndtering',
		'Sakstyper',
		'Partsinnsyn og saksuttrekk',
		'Administrasjon – forsider og visninger',
		'Posthåndtering',
		'Superbrukerfunksjoner',
		'Økonomi i barnevernet',
		'Avtaler',
		'Administrasjon – diverse funksjonalitet'
	];
	const digitalCourse = {
		categoryId: pc['radgivning-og-opplaering'],
		priceNok: 28050,
		prices: prices('Fastpris', 'Digitalt kurs i Teams, inntil 2 timer | 28 050 kr')
	};
	const recordingNote =
		'Kurset ledes av en erfaren fagekspert fra Netcompany og inkluderer kursmateriell og videoopptak for repetisjon.';

	const products = await db
		.insert(s.product)
		.values([
			{
				categoryId: pc['radgivning-og-opplaering'],
				name: 'Kompetansepartner',
				slug: 'kompetansepartner',
				summary: 'Abonnement som gir kommunen fast tilgang til en fagekspert på Modulus Barn.',
				description: paragraphs(
					'Kompetansepartner er en abonnementstjeneste som gir kommunen regelmessig tilgang til fageksperter på Modulus Barn. Tjenesten bidrar til effektiv bruk av løsningen, raske avklaringer og kontinuerlig kompetansebygging.',
					'Trygghet og kompetanse i hverdagen\nKommunen får erfarne fageksperter som hjelper med å bruke løsningen riktig, løse utfordringer raskt og bygge varig intern kompetanse.',
					'Strukturert støtte og oppfølging\nFaste møter med forberedte spørsmål, konkrete svar og korte oppsummeringer. Mellom møtene får dere raske avklaringer, e-poststøtte og opplæring ved behov.',
					'Forutsigbarhet og fleksibilitet\nFast pris og tydelig innhold. En fast fagekspert følger kommunen over tid og sikrer kontinuitet, med mulighet for enkel utvidelse ved behov.',
					list('Pakkene', [
						'Basis: 3 digitale møter, arbeidsdokument og oppsummering etter hvert møte',
						'Pluss: 6 digitale møter, arbeidsdokument, oppsummering, dedikert kontaktperson og e-poststøtte mellom møtene',
						'Premium: alt i Pluss, med prioritert e-poststøtte og opplæringsøkt for nye ansatte'
					]),
					'Abonnementet varer i 12 måneder. Dere kan bytte pakke hvis behovene endrer seg.'
				),
				priceNok: 20000,
				priceUnit: 'per år',
				priceFrom: true,
				prices: prices(
					'Abonnement, 12 måneder',
					'Basis | 20 000 kr/år',
					'Pluss | 55 000 kr/år',
					'Premium | 67 000 kr/år'
				),
				isNew: true
			},
			{
				categoryId: pc['radgivning-og-opplaering'],
				name: 'E-læring',
				slug: 'e-laering',
				summary: 'Opplæring i Modulus Barn i eget tempo på Netcompanys digitale læringsplattform.',
				description: paragraphs(
					'E-læring gir brukerne av Modulus Barn fleksibel opplæring på Netcompanys digitale læringsplattform. Brukerne tar opplæringen i eget tempo, og innholdet oppdateres i takt med ny funksjonalitet i løsningen.',
					'Fleksibel opplæring\nKorte økter når det passer, og mulighet til å repetere ved behov. Passer både for nye og erfarne brukere.',
					'Relevant og oppdatert innhold\nDekker sentrale arbeidsprosesser og funksjoner, blant annet bekymringsmelding, undersøkelse, vedtak og tiltak, økonomi og saksuttrekk. Det finnes også moduler for Innbyggertjenester og HRM-integrasjon.',
					'Enkel administrasjon\nNetcompany drifter løsningen i eget LMS. Kommunen registrerer nye ansatte via en selvregistreringslenke, og tilganger kan oppdateres ved behov.',
					list('Tjenesten inkluderer', [
						'Tilgang til e-læringsplattformen',
						'Opplæringsmoduler i Modulus Barn',
						'Løpende oppdatert innhold',
						'Enkel administrasjon av brukere'
					]),
					'Etablering er inkludert. Drift og vedlikehold faktureres som en økning i det månedlige vederlaget i SSA-L-avtalen.'
				),
				priceNok: 6000,
				priceUnit: 'per år',
				priceFrom: true,
				prices: prices(
					'Drift og vedlikehold, etter antall ansatte',
					'0–30 ansatte | 6 000 kr/år',
					'31–80 ansatte | 12 000 kr/år',
					'81–200 ansatte | 24 000 kr/år',
					'201–500 ansatte | 60 000 kr/år',
					'Over 500 ansatte | 120 000 kr/år',
					'Etablering',
					'Etablering av e-læring | Inkludert'
				)
			},
			{
				categoryId: pc['radgivning-og-opplaering'],
				name: 'Modulus Barn-kurs',
				slug: 'modulus-barn-kurs',
				summary:
					'Grundig innføring i hele Modulus Barn for superbrukere, sluttbrukere og systemadministratorer.',
				description: paragraphs(
					'Kurset gir deltakerne en grundig innføring i Modulus Barn, slik at de kan bruke løsningen effektivt og støtte andre brukere i kommunen.',
					'Helhetlig systemforståelse\nDekker blant annet bekymringsmeldinger, undersøkelser og tiltak, aktiviteter og oppfølging, planer og evaluering, dokument- og posthåndtering, partsinnsyn, økonomi, avtaler, administrasjon og superbrukerfunksjoner.',
					'Kompetanse som kan deles videre\nKurset gir en bred og dyp forståelse av løsningen og hvordan funksjonaliteten henger sammen, slik at superbrukere kan støtte og lære opp sluttbrukere i egen kommune.',
					'Fysisk eller digitalt\nEt todagers fysisk kurs hos kommunen, eller et digitalt opplegg over én uke med digitale møter og egentrening mellom øktene. Til det digitale kurset anbefaler vi at kommunen har e-læring som støtte til egentreningen.',
					list('Kursinnhold', courseModules),
					'Målgruppe: superbrukere, sluttbrukere og systemadministratorer. Opptil 30 deltakere.'
				),
				priceNok: 63250,
				priceFrom: true,
				prices: prices(
					'Fastpris',
					'Fysisk, 2 dager à 8 timer, 2 kursholdere | 72 500 kr + reise',
					'Digitalt over 1 uke, 1 kursholder | 63 250 kr'
				)
			},
			{
				categoryId: pc['radgivning-og-opplaering'],
				name: 'Oppfriskningskurs',
				slug: 'oppfriskningskurs',
				summary: 'Målrettet oppdatering i Modulus Barn, med temaer kommunen velger selv.',
				description: paragraphs(
					'Oppfriskningskurs gir deltakerne en målrettet oppdatering av kunnskap og ferdigheter i Modulus Barn, tilpasset kommunens behov og valgte temaer.',
					'Oppdatering av kompetanse\nKurset bygger på temaene fra Modulus Barn-kurset og frisker opp kunnskap om sentrale funksjoner og arbeidsprosesser.',
					'Tilpasset kommunens behov\nKommunen velger hvilke moduler fra kursinnholdet som skal være med. Antall moduler tilpasses varigheten og avtales før kurset.',
					'Fysisk eller digitalt\nEt fysisk dagskurs på inntil 8 timer, eller et digitalt halvdagskurs på inntil 4 timer i Teams.',
					list('Velg fra kursinnholdet', courseModules),
					'Opplæringen ledes av en ekspert fra Netcompany og inkluderer digitalt kursmateriell for repetisjon, og ved digitalt kurs også videoopptak. Målgruppe: superbrukere, sluttbrukere og systemadministratorer. Opptil 30 deltakere.'
				),
				priceNok: 28050,
				priceFrom: true,
				prices: prices(
					'Fastpris, 1 kursholder',
					'Fysisk dagskurs, inntil 8 timer | 36 300 kr + reise',
					'Digitalt halvdagskurs, inntil 4 timer | 28 050 kr'
				)
			},
			{
				categoryId: pc['radgivning-og-opplaering'],
				name: 'Helsesjekk',
				slug: 'helsesjekk',
				summary:
					'Netcompany går gjennom hvordan kommunen bruker Modulus Barn og gir konkrete anbefalinger.',
				description: paragraphs(
					'Helsesjekk gir kommunen en strukturert gjennomgang av hvordan Modulus Barn brukes i praksis, med mål om å finne forbedringsområder og sikre mer effektiv bruk av løsningen.',
					'Gjennomgang av arbeidsprosesser og arbeidsflyt\nSammen med kommunens utvalgte ressurser går vi gjennom hvordan Modulus Barn brukes i dag, hvilke funksjoner og moduler som er tatt i bruk, og om arbeidsprosessene kan forenkles.',
					'Konkrete anbefalinger og forbedringstiltak\nHelsesjekken avdekker gap, ineffektivitet og forbedringsområder. Kommunen får en kort oppsummering med konkrete anbefalinger, blant annet om konfigurasjon og tilpasning av Modulus Barn.',
					'Grunnlag for videre opplæring\nGjennomgangen kartlegger også behov for mer opplæring og kan gi en anbefalt agenda for et oppfriskningskurs.',
					list('Slik gjennomføres helsesjekken', [
						'Forberedelse: kommunen deler en overordnet beskrivelse av dagens arbeidsprosesser.',
						'Fysisk arbeidsmøte: inntil 6 timer hos kommunen, med 8–10 deltakere som kjenner arbeidsprosessene og bruken av Modulus Barn. To fra Netcompany deltar.',
						'Oppsummering: Netcompany lager en kort oppsummering med funn, anbefalinger og forslag til videre tiltak.'
					]),
					'Fastprisen inkluderer planlegging, forberedelse, gjennomføring og oppsummering. Reise og opphold kommer i tillegg. Oppfriskningskurs og annen videre bistand avtales separat.'
				),
				priceNok: 43120,
				priceUnit: '+ reise',
				prices: prices(
					'Fastpris',
					'Fysisk arbeidsmøte, inntil 6 timer | 43 120 kr',
					'Reise og opphold | Kommer i tillegg'
				),
				isNew: true
			},
			{
				...digitalCourse,
				name: 'Økonomikurs',
				slug: 'okonomikurs',
				summary: 'Praktisk innføring i økonomifunksjonaliteten i Modulus Barn.',
				description: paragraphs(
					'Økonomikurs gir en praktisk innføring i økonomifunksjonaliteten i Modulus Barn, slik at deltakerne kan håndtere økonomiske prosesser effektivt og riktig.',
					'Praktisk bruk av økonomifunksjonaliteten\nInnføring i sentrale økonomifunksjoner, blant annet dimensjoner, økonomiske rammer, transaksjoner, faktura og bokføring.',
					'Integrasjon og økonomisk oversikt\nDeltakerne lærer om integrasjonsfunksjonalitet, remittering og hvordan økonomiske data kan følges opp, rapporteres og eksporteres.',
					list('Kursinnhold', [
						'Del 1, grunnleggende: dimensjoner, økonomiske rammer og transaksjoner',
						'Del 2, integrasjonsfunksjonalitet: faktura, bokføring og remittering',
						'Del 3, oversikt: økonomisk oversikt, nøkkeltall og eksport av data'
					]),
					`Målgruppe: merkantile, superbrukere, administratorer og ansatte innen økonomi og regnskap. Opptil 30 deltakere. ${recordingNote}`
				)
			},
			{
				...digitalCourse,
				name: 'Innbyggertjenesterkurs',
				slug: 'innbyggertjenesterkurs',
				summary:
					'Praktisk innføring i Innbyggertjenester og arbeidsflyten mot Min kommune – barnevern.',
				description: paragraphs(
					'Kurset gir en praktisk innføring i Innbyggertjenester i Modulus Barn, med vekt på sentrale funksjoner og arbeidsflyten mellom Modulus Barn og Min kommune – barnevern.',
					'Praktisk bruk av Innbyggertjenester\nSentrale funksjoner og hvordan Innbyggertjenester brukes i det daglige arbeidet i Modulus Barn.',
					'Helhetlig arbeidsflyt\nSamspillet mellom Modulus Barn og Min kommune – barnevern, fra tilgang og samtykke til dokumentdeling og behandling av innsyn.',
					list('Kursinnhold', [
						'Introduksjon til Innbyggertjenester i Modulus Barn',
						'Tilgang og rettigheter til Innbyggertjenester',
						'Tilgang til Min kommune – barnevern for parter',
						'Innbyggertjenestesaker',
						'Innsynslogg',
						'Saksuttrekk og innsynsforespørsler',
						'Samtykke',
						'Dokumentmedvirkning',
						'Flyten mellom Modulus Barn og Min kommune – barnevern',
						'Demo av Innbyggertjenester og Min kommune – barnevern'
					]),
					'Målgruppe: superbrukere og andre relevante brukere. Opptil 30 deltakere. Kurset inkluderer presentasjonsmateriell og opptak for repetisjon.'
				)
			},
			{
				...digitalCourse,
				name: 'Arkivkurs',
				slug: 'arkivkurs',
				summary:
					'Praktisk innføring i arkivering i Modulus Barn, med innebygd arkiv eller Fiks Arkiv.',
				description: paragraphs(
					'Arkivkurs gir en praktisk innføring i arkivering i Modulus Barn: hva som arkiveres, hvordan arkivstrukturen er bygget opp og hvordan løsningen støtter kommunens arkivansvar.',
					'Felles grunnlag for arkivering\nKurset starter med regelverk, Noark 5, arkivstruktur, BK-plan og hva som arkiveres og når.',
					'Tilpasset kommunens arkivløsning\nKurset tilpasses kommunens nåværende eller ønskede oppsett: innebygd arkiv i Modulus Barn, eller ekstern arkivkjerne via KS Fiks Arkiv. Dette sporet dekker oppsett, tilgang til arkivert materiale og arkivuttrekk.',
					list('Kursinnhold', [
						'Del 1, felles grunnlag: introduksjon, regelverk og Noark 5, arkivstruktur, hva som arkiveres og når, BK-plan',
						'Del 2A, innebygd arkiv: tilgang til arkiverte data, oppsett og innstillinger, arkivuttrekk',
						'Del 2B, Fiks Arkiv: hva integrasjonen sender og når, tilgang til det som er arkivert, oppsett, arkivuttrekk'
					]),
					`Målgruppe: superbrukere, saksbehandlere og ansatte med arkivansvar. Opptil 30 deltakere. ${recordingNote}`
				)
			},
			{
				...digitalCourse,
				name: 'Barnevernsvaktkurs',
				slug: 'barnevernsvaktkurs',
				summary: 'Praktisk innføring i barnevernsvaktfunksjonen i Modulus Barn.',
				description: paragraphs(
					'Barnevernsvaktkurs gir ansatte i barnevernsvakten en praktisk innføring i barnevernsvaktfunksjonen i Modulus Barn, med vekt på effektiv og trygg saksbehandling.',
					'Praktisk bruk av barnevernsvaktfunksjonen\nNavigasjon, opprettelse og håndtering av saker og dokumentasjon i Modulus Barn.',
					'Effektiv og trygg saksbehandling\nDeltakerne lærer blant annet å registrere henvendelser, håndtere akuttvedtak og sikre dokumentflyten mellom barnevernsvakt og barneverntjeneste.',
					list('Kursinnhold', [
						'Introduksjon til barnevernsvakt',
						'Forsider og visninger',
						'Gjennomgang av innhold i faner',
						'Opprettelse av barnevernsvaktsak',
						'Dokumentasjon av aktiviteter',
						'Kopiere hendelser og dokumentasjon',
						'Dokumentasjon til barneverntjenesten (SvarUt og SvarInn, inkl. postliste)',
						'Akuttvedtak',
						'Selvautorisering av en sak',
						'Åpne og lukke barnevernsvaktsaken'
					]),
					`Målgruppe: barnevernsvakten og andre interessenter. Opptil 30 deltakere. ${recordingNote}`
				)
			},
			{
				categoryId: pc.arbeidsmoter,
				name: 'Arbeidsmøte',
				slug: 'arbeidsmote',
				summary: 'Møte med en fagekspert fra Netcompany om et tema kommunen velger selv.',
				description: paragraphs(
					'Arbeidsmøte er et behovstilpasset møte der kommunen velger tema og får hjelp fra en erfaren fagekspert fra Netcompany. Ved bestilling godkjenner kommunen bruk av inntil 5 konsulenttimer. Flere timer eller flere arbeidsmøter kan avtales ved behov.',
					list('Slik fungerer det', [
						'Kommunen bestiller arbeidsmøte innen ønsket tema.',
						'Kommunen sender inn agenda og behovsbeskrivelse som grunnlag for forberedelsene.',
						'Netcompany avklarer behov og omfang og forbereder møtet, slik at veiledningen blir relevant og målrettet.'
					]),
					'Arbeidsmøtet holdes digitalt i Teams for deltakere fra kommunen. Fysisk møte kan avtales mot tillegg for reise og reisetid.'
				),
				prices: prices(
					'Timebasert',
					'Inntil 5 konsulenttimer per møte | Etter SSA-L-avtalen',
					'Fysisk møte | + reise og reisetid'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Innbyggertjenester',
				slug: 'innbyggertjenester',
				summary:
					'Kobler Modulus Barn til Min kommune – barnevern, for sikker digital samhandling med barn og foresatte.',
				description: paragraphs(
					'Innbyggertjenester kobler Modulus Barn til «Min kommune – barnevern» fra KS Digital og gir barn og foresatte en sikker digital kanal til barneverntjenesten. Innbyggerne kan blant annet få innsyn i egen sak, medvirke på dokumenter og svare på samtykker digitalt.',
					'Sikker digital samhandling\nTrygg digital kommunikasjon mellom barneverntjenesten og innbyggerne gjennom Min kommune – barnevern.',
					'Enklere arbeidsprosesser\nSaksbehandler håndterer innsyn, dokumentdeling og samtykker direkte i Modulus Barn, og informasjonen utveksles med Min kommune – barnevern.',
					'Innsyn og medvirkning\nBarn og foresatte får tilgang til informasjon i egen sak, kan medvirke på dokumenter og svare på samtykkeforespørsler digitalt.',
					list('Hva vi tilbyr', [
						'Etablering av testmiljø',
						'Etablering av produksjonsmiljø',
						'Opplæring'
					]),
					'Opplæring er et valgfritt tillegg: e-læring med Innbyggertjenester-modul (kjøpes separat) eller Innbyggertjenesterkurs (digitalt, 2 timer, 28 050 kr).'
				),
				priceNok: 18857,
				priceUnit: 'per år + etablering',
				priceFrom: true,
				prices: prices(
					'Etablering, engangskostnad',
					'Testmiljø | 28 000 kr',
					'Produksjonsmiljø | 28 000 kr',
					'Drift og vedlikehold, etter innbyggertall',
					'Under 10 000 innbyggere | 18 857 kr/år',
					'10 000–40 000 innbyggere | 23 571 kr/år',
					'40 000–100 000 innbyggere | 35 357 kr/år',
					'Over 100 000 innbyggere | 47 143 kr/år'
				),
				isNew: true
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Økonomi+',
				slug: 'okonomi-pluss',
				summary:
					'Fakturamodul for leverandørfakturaer, splitting av delrammer og opplasting av returfiler fra bank.',
				description: paragraphs(
					'Basisøkonomi er inkludert i Modulus Barn: økonomiske rammer og direkteutbetalinger kan registreres og remitteres, men flere steg må gjøres manuelt mellom Modulus Barn, banken og økonomisystemet. Økonomi+ gir blant annet fakturamodulen og opplasting av returfiler fra bank, slik at betalingsløpet for leverandørfakturaer kan håndteres i Modulus Barn.',
					'Fakturamodul for leverandørfakturaer\nLeverandørfakturaer registreres og knyttes til riktig økonomisk ramme og transaksjon, slik at dere har oversikt over hva som er fakturert og betalt.',
					'Remittering og splitting av delrammer\nTransaksjoner på rammer av typen leverandørfaktura kan remitteres direkte fra Modulus Barn. En ramme kan deles i delrammer som følges opp og utbetales hver for seg.',
					'Returfiler fra bank\nReturfiler fra banken lastes opp i Modulus Barn og oppdaterer status på hver utbetaling. Avviste transaksjoner følges opp direkte i Modulus Barn.',
					list('Betalingsløpet med Økonomi+', [
						'Faktura registreres i fakturamodulen',
						'Fakturaen knyttes til økonomisk ramme',
						'Transaksjonen remitteres til banken',
						'Returfil lastes opp og oppdaterer status'
					]),
					'Automatisk EHF-mottak, bokføringsintegrasjon og automatisk remittering (ARAR) bygger på Økonomi+ og bestilles i tillegg. EHF-mottak og bokføringsintegrasjon er inkludert i etableringen når de settes opp samtidig med Økonomi+. Kostnader fra tredjeparter kommer i tillegg.'
				),
				priceNok: 9996,
				priceUnit: 'per år + etablering',
				priceFrom: true,
				prices: prices(
					'Etablering, engangskostnad',
					'Økonomi+ med EHF-mottak og bokføringsintegrasjon | 42 000 kr',
					'Drift og vedlikehold, etter innbyggertall',
					'Opptil 10 000 innbyggere | 9 996 kr/år',
					'10 000–40 000 innbyggere | 20 004 kr/år',
					'Over 40 000 innbyggere | 39 996 kr/år'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Bokføringsintegrasjon',
				slug: 'bokforingsintegrasjon',
				summary:
					'Overfører bokføringsbilag automatisk fra Modulus Barn til kommunens økonomisystem. Forutsetter Økonomi+.',
				description: paragraphs(
					'Bokføringsintegrasjonen er et valgfritt tillegg til Økonomi+. Den overfører nødvendig informasjon automatisk som bokføringsbilag til kommunens økonomisystem, så dere slipper å registrere det samme i flere systemer.',
					'Automatisk overføring til økonomisystemet\nNår økonomiske transaksjoner opprettes og behandles i Modulus Barn, sendes informasjonen automatisk til økonomisystemet for bokføring.',
					'Mindre manuelt arbeid\nMindre dobbeltarbeid og lavere risiko for feilregistrering.',
					'Bedre oversikt og oppfølging\nRemittering av delrammer sender bokføringsbilag til økonomisystemet. Transaksjoner som oppdateres via returfil fra bank, bokføres videre gjennom integrasjonen.',
					'Støtter Visma Enterprise, Unit4 ERP/ERPx og Xledger\nOppsettet krever også arbeid hos leverandøren av økonomisystemet. Visma må sette opp et endepunkt (WS Voucher); kommuner med Visma Enterprise (Plus) har WS Voucher i lisensen og betaler bare for oppsettet. For Unit4 ERP må kommunen inngå avtale med Vivicta, som tilbyr integrasjon via Netcompanys økonomi-API eller via endepunkt for ERPx. Kommuner med Xledger må få Xledger til å sette opp et endepunkt.',
					'Netcompany anbefaler bokføringsintegrasjon og automatisk remittering (ARAR) sammen for mest mulig automatisering. Kostnader fra leverandøren av økonomisystemet kommer i tillegg, uansett når integrasjonen settes opp.'
				),
				priceNok: 42000,
				priceUnit: 'i etablering',
				prices: prices(
					'Etablering',
					'Samtidig med Økonomi+ | Inkludert',
					'Separat etablering | 42 000 kr',
					'Drift og vedlikehold',
					'Løpende kostnad | Dekkes av Økonomi+',
					'Tredjepart: leverandør av økonomisystemet',
					'Visma Enterprise, WS Voucher | 43 600 kr',
					'Unit4 ERP (Vivicta) | Kontakt Vivicta',
					'Xledger | Kontakt Xledger'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Automatisk EHF-mottak',
				slug: 'automatisk-ehf-mottak',
				summary:
					'EHF-fakturaer til barnevernet kommer rett inn i fakturamodulen i Modulus Barn. Forutsetter Økonomi+.',
				description: paragraphs(
					'Automatisk EHF-mottak er et valgfritt tillegg til Økonomi+. Fakturaer til barnevernet mottas elektronisk direkte i fakturamodulen, slik at de kan behandles og knyttes til riktig sak uten at saksbehandler må hente informasjon fra andre systemer.',
					'Faktura direkte i Modulus Barn\nFakturaen er tilgjengelig der resten av arbeidet med saken gjøres.',
					'Enklere behandling og mindre manuelt arbeid\nFakturaen behandles i fakturamodulen og knyttes til riktig sak og økonomi, uten manuell registrering.',
					'Trygg håndtering av sensitiv informasjon\nFakturaer til barnevernet kan inneholde sensitiv informasjon. Når de behandles i Modulus Barn, slipper de å gå gjennom kommunens ordinære fakturabehandling.',
					'Krever avtale med aksesspunktleverandør\nNetcompanys standardoppsett bruker LOGIQ. LOGIQ fakturerer sine kostnader direkte, uansett når mottaket settes opp. Annen aksesspunktleverandør krever endringer i Økonomi+ som ikke er inkludert.'
				),
				priceNok: 21000,
				priceUnit: 'i etablering',
				prices: prices(
					'Etablering',
					'Samtidig med Økonomi+ | Inkludert',
					'Separat etablering | 21 000 kr',
					'Drift og vedlikehold',
					'Løpende kostnad | Dekkes av Økonomi+',
					'Tredjepart: LOGIQ',
					'Etablering | 4 545 kr',
					'Abonnement per juridisk enhet | 385 kr/mnd',
					'Per faktura eller kreditnota | 1,66 kr'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Automatisk remittering (ARAR)',
				slug: 'automatisk-remittering-arar',
				summary:
					'Utbetalinger går automatisk til banken, og status oppdateres i Modulus Barn. Forutsetter Økonomi+.',
				description: paragraphs(
					'Automatisk remittering (ARAR) er et valgfritt tillegg til Økonomi+. Med bare Økonomi+ flyttes remitteringsfiler og returfiler manuelt mellom Modulus Barn og banken. Med ARAR skjer dette automatisk.',
					'Automatiske utbetalinger\nUtbetalinger sendes automatisk som remitteringsfil til banken, blant annet basert på forfallsdato. Selve godkjenningen gjøres i banken.',
					'Automatisk oppdatering etter utbetaling\nNår banken har behandlet utbetalingen, oppdateres status automatisk i Modulus Barn.',
					'Mindre manuelt arbeid\nHele flyten mellom Modulus Barn og banken blir automatisert. Sammen med bokføringsintegrasjonen bokføres også transaksjonene automatisk, så hele løpet går uten manuelle steg.',
					'Støttede banker: SpareBank 1-alliansen, DNB og Danske Bank. Bruker kommunen en annen bank, ta kontakt med Netcompany. Kommunen bestiller selv et SFTP-filområde for filutveksling i banken; eventuelle kostnader for det avhenger av bankavtalen.'
				),
				priceNok: 42000,
				priceUnit: 'i etablering',
				prices: prices(
					'Etablering',
					'Etablering og konfigurering | 42 000 kr',
					'Drift og vedlikehold',
					'Løpende kostnad | Dekkes av Økonomi+'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'HRM-integrasjon',
				slug: 'hrm-integrasjon',
				summary:
					'Overfører utbetalingsplaner fra Modulus Barn til kommunens lønns- og personalsystem.',
				description: paragraphs(
					'HRM-integrasjonen kobler Modulus Barn til kommunens lønns- og personalsystem og overfører utbetalingsplaner direkte. Det gir mindre manuell registrering og bedre oversikt over utbetalingene.',
					'Færre feilutbetalinger\nSystemet sjekker at nødvendige felt er fylt ut før oversending. Feil ved overføringen varsles, så saksbehandler kan rette og sende på nytt.',
					'Mindre manuelt arbeid\nUtbetalingsplaner opprettes og oppdateres i Modulus Barn og overføres til lønnssystemet, så de ikke må vedlikeholdes to steder.',
					'Oversikt og sporbarhet\nSaksbehandler ser status på utbetalingene direkte i Modulus Barn og om de er overført til lønnssystemet.',
					list('Hva vi tilbyr', [
						'Etablering av testmiljø',
						'Etablering av produksjonsmiljø',
						'Opplæring'
					]),
					'Opplæring er et valgfritt tillegg: e-læring med HRM-modul (kjøpes separat) eller digitalt kurs (2 timer, 28 050 kr).'
				),
				priceNok: 18480,
				priceUnit: 'per år + etablering',
				priceFrom: true,
				prices: prices(
					'Etablering, engangskostnad',
					'Testmiljø | 21 000 kr',
					'Produksjonsmiljø | 21 000 kr',
					'Drift og vedlikehold, etter innbyggertall',
					'Opptil 10 000 innbyggere | 18 480 kr/år',
					'10 000–40 000 innbyggere | 23 100 kr/år',
					'Over 40 000 innbyggere | 30 030 kr/år'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Innebygd arkiv',
				slug: 'innebygd-arkiv',
				summary: 'Arkivløsning direkte i Modulus Barn, uten ekstern arkivkjerne.',
				description: paragraphs(
					'Innebygd arkiv gir kommunen en helhetlig arkivløsning direkte i Modulus Barn, uten behov for en ekstern arkivkjerne.',
					'Integrert arkivløsning\nArkivet er utviklet av Netcompany og er en del av Modulus Barn. Det gir færre eksterne systemer og integrasjoner å forvalte.',
					'Automatisk og standardisert arkivering\nDokumenter journalføres og arkiveres automatisk etter gjeldende bevarings- og kassasjonsplan. Arkivet bygger på Noark 5-standarden.',
					'Enkel etablering og forvaltning\nNetcompany gjør oppsettet ved etablering. Arkiverte dokumenter ivaretas med sporbarhet og historikk.',
					'Prisen baseres på lagringsforbruket, med innbyggertall som pekepinn. Etablering er inkludert i alle pakker. Ved endret bruk flyttes kommunen til en passende pakke.'
				),
				priceNok: 12000,
				priceUnit: 'per år',
				priceFrom: true,
				prices: prices(
					'Drift og vedlikehold, etter lagringsbehov',
					'Under 4 000 innbyggere, 300 GB | 12 000 kr/år',
					'Over 4 000 innbyggere, 500 GB | 24 000 kr/år',
					'Over 15 000 innbyggere, 1 TB | 36 000 kr/år',
					'Over 50 000 innbyggere, 2 TB | 60 000 kr/år',
					'Etablering',
					'Etablering | Inkludert'
				)
			},
			{
				categoryId: pc.integrasjonsstotte,
				name: 'Fiks Arkiv for Documaster',
				slug: 'fiks-arkiv-documaster',
				summary: 'Arkivmeldinger går direkte fra Modulus Barn til kommunens Documaster-arkiv.',
				description: paragraphs(
					'Fiks Arkiv kobler Modulus Barn til kommunens arkivløsning via Fiks-plattformen. Netcompany tilbyr integrasjon mot Documaster, slik at arkivmeldinger overføres direkte fra Modulus Barn til kommunens arkiv.',
					'Integrert arkivløsning\nEn standardisert flyt av arkivmeldinger mellom Modulus Barn og kommunens arkiv.',
					'Automatisert arkivering\nDokumentasjon arkiveres uten manuell overføring mellom systemene.',
					'Etablering og støtte\nNetcompany konfigurerer integrasjonen i Modulus Barn. Kommunen fullfører oppsettet av KS Fiks Arkiv med en steg-for-steg-veiledning, eller kjøper etableringsstøtte.',
					'Løsningen forutsetter Fiks Protokoll fra KS Digital, som avtales og prises separat i KS Digitals priskalkulator. Kommuner som allerede har Fiks Protokoll, trenger ikke etablere det på nytt.'
				),
				priceNok: 8400,
				priceUnit: 'i etablering',
				prices: prices(
					'Netcompany',
					'Etablering, obligatorisk | 8 400 kr',
					'Etableringsstøtte, valgfritt | Løpende timer',
					'Tredjepart: KS Digital',
					'Fiks Protokoll | Se KS Digitals priskalkulator'
				)
			},
			{
				categoryId: pc.migreringsstotte,
				name: 'Etter-migrering',
				slug: 'etter-migrering',
				summary:
					'Overføring av historiske data fra tidligere fagsystem til Modulus Barn, etter at kommunen er i drift.',
				description: paragraphs(
					'Etter-migrering overfører historiske data fra kommunens tidligere fagsystem til Modulus Barn etter at kommunen allerede har tatt løsningen i bruk.',
					'Analyse og kvalitetssikring av data\nNetcompany analyserer datagrunnlaget og lager en rapport over feil og mangler som må avklares før migrering. Rapporten gjennomgås sammen med kommunen.',
					'Tilrettelegging og migrering\nNetcompany tilrettelegger dataene etter avklaringene og overfører dem til kommunens produksjonsmiljø.',
					'Håndtering av duplikate saker\nSiden kommunen allerede er i produksjon, kan migreringen gi duplikate barnevernssaker. Netcompany finner og håndterer dem som en del av leveransen.',
					list('Slik gjennomføres etter-migreringen', [
						'Dataanalyse',
						'Gjennomgang og avklaringer med kommunen',
						'Tilrettelegging og migrering',
						'Kontroll og opprydding'
					]),
					'Forutsetning: database fra tidligere fagsystem. Tidspunkt avtales med kommunen.'
				),
				priceNok: 108050,
				priceUnit: 'fastpris',
				prices: prices(
					'Fastpris',
					'Dataanalyse, gjennomgang, migrering og håndtering av duplikater | 108 050 kr'
				)
			}
		])
		.returning();

	await db.insert(s.post).values([
		{
			kind: 'ad',
			title: 'Nytt: Kompetansepartner',
			slug: 'nytt-kompetansepartner',
			excerpt:
				'En fast fagekspert på Modulus Barn som abonnement, med faste møter, oppsummeringer og støtte mellom møtene.',
			body: 'Med Kompetansepartner får kommunen en fast fagekspert fra Netcompany som følger dere over tid. Velg mellom Basis, Pluss og Premium, fra 20 000 kr i året.\n\nAbonnementet varer i 12 måneder, og dere kan bytte pakke hvis behovene endrer seg. Bestill i Toolkit.',
			ctaLabel: 'Se tjenesten',
			ctaUrl: '/produkter/kompetansepartner',
			published: true,
			pinned: true,
			authorId: u.admin,
			publishedAt: daysAgo(1)
		},
		{
			kind: 'ad',
			title: 'Kurs i Modulus Barn våren 2027',
			slug: 'kurs-varen-2027',
			excerpt:
				'Modulus Barn-kurs, oppfriskningskurs og digitale fagkurs i økonomi, arkiv, barnevernsvakt og Innbyggertjenester.',
			body: 'Modulus Barn-kurset og oppfriskningskurset holdes fysisk hos dere eller digitalt. Fagkursene holdes i Teams og varer inntil to timer.\n\nBestill kurs i Toolkit, så avtaler vi tidspunkt med dere.',
			ctaLabel: 'Se kursene',
			ctaUrl: '/produkter?kategori=radgivning-og-opplaering',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(4)
		},
		{
			kind: 'release',
			title: 'Modulus Barn 2026.4: raskere søk og tidligere fristvarsler',
			slug: 'modulus-barn-2026-4',
			excerpt:
				'Søket er opptil tre ganger raskere, og fristvarsler kan nå settes flere dager før fristen går ut.',
			body: 'Versjon 2026.4 er rullet ut til alle kommuner.\n\nNytt i denne versjonen:\n• Søket er opptil tre ganger raskere\n• Fristvarsler kan settes flere dager før fristen\n• Flere flettefelt i dokumentmalene\n• Retting av feil ved utskrift av tiltaksplaner',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(2)
		},
		{
			kind: 'release',
			title: 'Nye maler i BFK for undersøkelsesfasen',
			slug: 'nye-maler-bfk-undersokelse',
			excerpt:
				'Oppdaterte maler for undersøkelsesplan og konklusjon, utarbeidet sammen med kommunene.',
			body: 'Malene for undersøkelsesplan og konklusjon i BFK er oppdatert etter innspill fra kommunene. De nye malene er tilgjengelige for alle fra i dag.',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(9)
		},
		{
			kind: 'news',
			title: 'Prioriteringsmøte for videreutvikling 2027',
			slug: 'prioriteringsmote-2027',
			excerpt:
				'Kommunene bestemmer i fellesskap hva som skal utvikles videre. Legg inn ønskene deres på ønskelisten før 1. desember.',
			body: 'I desember møtes kommunene for å prioritere videreutviklingen av Modulus Barn for 2027.\n\nLegg inn ønskene deres på ønskelisten før 1. desember. Netcompany samler ønskene og tar dem med inn i møtet.',
			ctaLabel: 'Til ønskelisten',
			ctaUrl: '/onsker',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(12)
		},
		{
			kind: 'news',
			title: 'Utkast: Brukerundersøkelse 2027',
			slug: 'brukerundersokelse-2027',
			excerpt: 'Hjelp oss å bli bedre.',
			body: 'Utkast – ikke publisert.',
			published: false,
			authorId: u.admin
		}
	]);

	const wishCategories = await db
		.insert(s.wishCategory)
		.values([
			{
				name: 'Saksbehandling og arbeidsflyt',
				description: 'Daglig arbeid i saker, frister og oppgaver.',
				sortOrder: 1
			},
			{
				name: 'BFK og maler',
				description: 'Barnevernfaglig kvalitetssystem, maler og dokumenter.',
				sortOrder: 2
			},
			{
				name: 'Rapportering og styringsdata',
				description: 'Rapporter, statistikk og oversikter for ledere.',
				sortOrder: 3
			},
			{
				name: 'Integrasjoner',
				description: 'Arkiv, folkeregister, SvarUt og andre systemer.',
				sortOrder: 4
			},
			{
				name: 'Innbyggertjenester',
				description: 'Digital dialog med barn, unge og familier.',
				sortOrder: 5
			},
			{
				name: 'Brukervennlighet',
				description: 'Utseende, navigasjon og universell utforming.',
				sortOrder: 6
			}
		])
		.returning();
	const wc = Object.fromEntries(wishCategories.map((cat) => [cat.name, cat.id]));

	const wishes: {
		kommune: string;
		category: string | null;
		title: string;
		description: string;
		status: 'new' | 'reviewing' | 'planned' | 'done' | 'declined';
		adminNote?: string;
		age: number;
	}[] = [
		{
			kommune: 'Bergen',
			category: 'Saksbehandling og arbeidsflyt',
			title: 'Samlet oversikt over samværsavtaler',
			description:
				'Vi ønsker en oversikt over alle aktive samværsavtaler per enhet, med filter på dato, slik at vi slipper å gå inn i hver sak.',
			status: 'planned',
			adminNote: 'Takk! Dette er tatt med i planen for neste versjon etter prioriteringsmøtet.',
			age: 20
		},
		{
			kommune: 'Bergen',
			category: 'Rapportering og styringsdata',
			title: 'Eksport av fristoversikten til Excel',
			description: 'Ledergruppen vil gjerne ha fristoversikten som regneark før møtene.',
			status: 'new',
			age: 2
		},
		{
			kommune: 'Tromsø',
			category: 'BFK og maler',
			title: 'Kopiere tiltaksplan fra forrige periode',
			description:
				'Når en tiltaksplan skal fornyes, hadde det spart mye tid å kunne starte fra forrige plan.',
			status: 'reviewing',
			adminNote: 'Vi ser på dette sammen med flere kommuner som har meldt samme behov.',
			age: 9
		},
		{
			kommune: 'Tromsø',
			category: null,
			title: 'Varsel når en sak overføres til min enhet',
			description: 'I dag oppdager vi overførte saker først når vi åpner saksoversikten.',
			status: 'new',
			age: 1
		},
		{
			kommune: 'Trondheim',
			category: 'Brukervennlighet',
			title: 'Mørk modus i saksbehandlingen',
			description: 'Flere hos oss jobber lange dager foran skjermen og ønsker et mørkt tema.',
			status: 'declined',
			adminNote: 'Ikke prioritert for 2027, men ønsket er notert.',
			age: 30
		},
		{
			kommune: 'Bodø',
			category: 'Integrasjoner',
			title: 'Tydeligere feilmeldinger fra arkivintegrasjonen',
			description:
				'Når en journalføring feiler, er det vanskelig å se hva som er galt uten å kontakte IT.',
			status: 'new',
			age: 4
		}
	];
	for (const w of wishes) {
		await db.insert(s.wish).values({
			municipalityId: k[w.kommune],
			categoryId: w.category ? wc[w.category] : null,
			title: w.title,
			description: w.description,
			status: w.status,
			adminNote: w.adminNote ?? '',
			createdAt: daysAgo(w.age)
		});
	}

	console.log(
		`Seeded ${kommuner.length} kommuner, ${users.length} users, ${products.length} products, ${wishes.length} wishes.`
	);
	console.log(`Admin login: admin@kommuneportalen.no, password "${DEMO_PASSWORD}"`);
}

try {
	await main();
} finally {
	await client.end();
}
