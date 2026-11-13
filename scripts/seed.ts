import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import * as s from '../src/lib/server/db/schema.ts';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema: s, casing: 'snake_case' });

const DEMO_PASSWORD = 'Passord123!';
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

type SeedThread = {
	category: string;
	author: string;
	title: string;
	body: string;
	age: number;
	pinned?: boolean;
	locked?: boolean;
	replies: { author: string; body: string; accepted?: boolean }[];
};

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
				['Oslo', '0301', 'Oslo', 'oslo.kommune.no'],
				['Bergen', '4601', 'Vestland', 'bergen.kommune.no'],
				['Trondheim', '5001', 'Trøndelag', 'trondheim.kommune.no'],
				['Stavanger', '1103', 'Rogaland', 'stavanger.kommune.no'],
				['Kristiansand', '4204', 'Agder', 'kristiansand.kommune.no'],
				['Tromsø', '5501', 'Troms', 'tromso.kommune.no'],
				['Bodø', '1804', 'Nordland', 'bodo.kommune.no'],
				['Ålesund', '1508', 'Møre og Romsdal', 'alesund.kommune.no'],
				['Drammen', '3301', 'Buskerud', 'drammen.kommune.no'],
				['Lillehammer', '3405', 'Innlandet', 'lillehammer.kommune.no'],
				['Fredrikstad', '3107', 'Østfold', 'fredrikstad.kommune.no'],
				['Tønsberg', '3905', 'Vestfold', 'tonsberg.kommune.no']
			].map(([name, number, county, emailDomain]) => ({ name, number, county, emailDomain }))
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
		},
		{
			key: 'kari',
			name: 'Kari Nordmann',
			email: 'kari.nordmann@bergen.kommune.no',
			role: 'user',
			municipalityId: k.Bergen,
			jobTitle: 'Barnevernleder'
		},
		{
			key: 'ola',
			name: 'Ola Hansen',
			email: 'ola.hansen@tromso.kommune.no',
			role: 'user',
			municipalityId: k['Tromsø'],
			jobTitle: 'Saksbehandler'
		},
		{
			key: 'sara',
			name: 'Sara Berg',
			email: 'sara.berg@trondheim.kommune.no',
			role: 'user',
			municipalityId: k.Trondheim,
			jobTitle: 'Fagkonsulent'
		},
		{
			key: 'jonas',
			name: 'Jonas Lie',
			email: 'jonas.lie@bodo.kommune.no',
			role: 'user',
			municipalityId: k['Bodø'],
			jobTitle: 'Fagsystemansvarlig'
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

	const categories = await db
		.insert(s.forumCategory)
		.values([
			{
				name: 'Bruk og arbeidsflyt',
				slug: 'bruk-og-arbeidsflyt',
				description: 'Spørsmål om daglig bruk av Modulus Barn.',
				sortOrder: 1
			},
			{
				name: 'BFK og faglige rutiner',
				slug: 'bfk-og-faglige-rutiner',
				description: 'Barnevernfaglig kvalitetssystem, maler og god praksis.',
				sortOrder: 2
			},
			{
				name: 'Integrasjoner',
				slug: 'integrasjoner',
				description: 'Bekymringsmeldinger, barnevernsregisteret, folkeregisteret, arkiv og SvarUt.',
				sortOrder: 3
			},
			{
				name: 'Rapportering og styring',
				slug: 'rapportering-og-styring',
				description: 'Statistikk, styringsdata og rapporter til ledelsen.',
				sortOrder: 4
			},
			{
				name: 'Innføring og oppstart',
				slug: 'innforing-og-oppstart',
				description: 'For kommuner som er i gang med å ta i bruk Modulus Barn.',
				sortOrder: 5
			},
			{
				name: 'Opplæring og superbrukere',
				slug: 'opplaering-og-superbrukere',
				description: 'Kurs, opplæringsopplegg og superbrukernettverk.',
				sortOrder: 6
			}
		])
		.returning();
	const c = Object.fromEntries(categories.map((cat) => [cat.slug, cat.id]));

	const threads: SeedThread[] = [
		{
			category: 'bruk-og-arbeidsflyt',
			author: 'admin',
			title: 'Velkommen til forumet – les dette først',
			body: 'Dette forumet er for dere som bruker og forvalter Modulus Barn i kommunene. Still spørsmål, del rutiner og fortell hva som fungerer – og hva som ikke gjør det.\n\nTre enkle regler:\n• Del aldri personopplysninger eller detaljer fra enkeltsaker. Bruk generelle eller oppdiktede eksempler.\n• Marker svaret som løste problemet, så finner andre det raskere.\n• Feil som haster meldes til brukerstøtte, ikke her.\n\nVi i Netcompany følger med og svarer når vi kan.',
			age: 30,
			pinned: true,
			locked: true,
			replies: []
		},
		{
			category: 'bruk-og-arbeidsflyt',
			author: 'ola',
			title: 'Fristvarsler i undersøkelsesfasen – hvordan har dere satt det opp?',
			body: 'Vi vil ha varsel to uker før fristen for undersøkelse går ut, men får bare varsel samme dag. Er det noen som har fått til dette i Modulus Barn?',
			age: 3,
			replies: [
				{
					author: 'kari',
					body: 'Gå til Innstillinger → Frister → Varsling og legg inn «14 dager før» som ekstra varsel. Det må gjøres per enhet.',
					accepted: true
				},
				{
					author: 'sara',
					body: 'Samme hos oss i Trondheim. Husk å lagre for hver enhet, ellers gjelder det bare din egen.'
				},
				{ author: 'ola', body: 'Takk begge to, det fungerte!' }
			]
		},
		{
			category: 'innforing-og-oppstart',
			author: 'jonas',
			title: 'Vi starter med Modulus Barn i januar – tips til innføringen?',
			body: 'Bodø går over til Modulus Barn i januar. Hva skulle dere ønske at dere visste før dere startet? Vi lurer særlig på opplæring, og hvor mye tid vi bør sette av til datamigrering.',
			age: 2,
			replies: [
				{
					author: 'kari',
					body: 'Sett av mer tid til opplæring enn dere tror, og bygg et superbrukernettverk tidlig. Vi hadde én superbruker per team, og det hjalp mye de første ukene.'
				},
				{
					author: 'sara',
					body: 'Migreringen gikk greit hos oss, men rydd i gamle saker før dere starter. Det sparer mye tid i testmigreringen.'
				}
			]
		},
		{
			category: 'bfk-og-faglige-rutiner',
			author: 'kari',
			title: 'Vår mal for tiltaksplan i BFK – deler gjerne',
			body: 'Vi har laget en mal for tiltaksplan med tydeligere mål og evalueringspunkter, basert på BFK. Si fra om dere vil ha den, så legger jeg den ut her.',
			age: 6,
			replies: [{ author: 'jonas', body: 'Ja takk! Vi går gjennom malene våre før oppstart.' }]
		},
		{
			category: 'integrasjoner',
			author: 'jonas',
			title: 'Erfaringer med arkivintegrasjonen (Noark 5)?',
			body: 'Hvor lang tid tok oppsettet av arkivintegrasjonen hos dere, og trengte dere hjelp fra IT eller arkivleverandøren?',
			age: 9,
			replies: [
				{
					author: 'sara',
					body: 'Et par dager. Vi trengte IT til sertifikatet og arkivleverandøren til å åpne tjenesten. Resten gjorde vi selv.'
				}
			]
		},
		{
			category: 'rapportering-og-styring',
			author: 'sara',
			title: 'Hvilke rapporter bruker dere i ledermøtene?',
			body: 'Vi skal lage en fast rapportpakke til ledermøtene. Hvilke rapporter eller nøkkeltall fra Modulus Barn bruker dere mest?',
			age: 11,
			replies: [
				{
					author: 'kari',
					body: 'Fristoversikten per enhet og antall åpne undersøkelser. Vi tar dem ut hver måned.'
				}
			]
		}
	];

	for (const t of threads) {
		const created = daysAgo(t.age);
		const [thread] = await db
			.insert(s.forumThread)
			.values({
				categoryId: c[t.category],
				authorId: u[t.author],
				title: t.title,
				body: t.body,
				pinned: t.pinned ?? false,
				locked: t.locked ?? false,
				createdAt: created,
				lastActivityAt: created
			})
			.returning();
		let last = created;
		for (const [i, r] of t.replies.entries()) {
			last = new Date(created.getTime() + (i + 1) * 3_600_000 * 5);
			const [reply] = await db
				.insert(s.forumReply)
				.values({ threadId: thread.id, authorId: u[r.author], body: r.body, createdAt: last })
				.returning();
			if (r.accepted) {
				await db
					.update(s.forumThread)
					.set({ acceptedReplyId: reply.id })
					.where(eq(s.forumThread.id, thread.id));
			}
		}
		await db
			.update(s.forumThread)
			.set({ lastActivityAt: last })
			.where(eq(s.forumThread.id, thread.id));
	}

	const productCategories = await db
		.insert(s.productCategory)
		.values([
			{
				name: 'Moduler',
				slug: 'moduler',
				description: 'Ny funksjonalitet i Modulus Barn.',
				sortOrder: 1
			},
			{
				name: 'Integrasjoner',
				slug: 'integrasjoner',
				description: 'Koble Modulus Barn til kommunens andre systemer.',
				sortOrder: 2
			},
			{
				name: 'Innføring og migrering',
				slug: 'innforing-og-migrering',
				description: 'Hjelp til å ta i bruk løsningen.',
				sortOrder: 3
			},
			{
				name: 'Kurs og opplæring',
				slug: 'kurs-og-opplaering',
				description: 'Kurs for saksbehandlere, ledere og superbrukere.',
				sortOrder: 4
			},
			{
				name: 'Brukerstøtte og tjenester',
				slug: 'brukerstotte-og-tjenester',
				description: 'Støtte og rådgivning i drift.',
				sortOrder: 5
			}
		])
		.returning();
	const pc = Object.fromEntries(productCategories.map((cat) => [cat.slug, cat.id]));

	const products = await db
		.insert(s.product)
		.values([
			{
				categoryId: pc.moduler,
				name: 'Digitale innbyggertjenester',
				slug: 'digitale-innbyggertjenester',
				orderUrl: 'https://netcompany.com/digibarnevern-modulus-barn/',
				summary: 'Sikker digital dialog med barn, unge og familier.',
				description:
					'Gi barn, unge og familier innsyn i egen sak og mulighet til å sende og motta dokumenter digitalt. Modulen rulles ut gradvis i samarbeid med kommunene.',
				priceNok: 60000,
				priceUnit: 'per år',
				isNew: true
			},
			{
				categoryId: pc.moduler,
				name: 'Mobil arbeidsflate',
				slug: 'mobil-arbeidsflate',
				orderUrl: 'https://netcompany.com/digibarnevern-modulus-barn/',
				summary: 'Dokumenter hjemmebesøk og samtaler fra nettbrett og mobil.',
				description:
					'Skriv notater, ta signaturer og se saksinformasjon på farten. Data lagres kryptert og synkroniseres når du er på nett igjen.',
				priceNok: 45000,
				priceUnit: 'per år',
				isNew: true
			},
			{
				categoryId: pc.moduler,
				name: 'Utvidet styringsdata',
				slug: 'utvidet-styringsdata',
				orderUrl: 'https://netcompany.com/digibarnevern-modulus-barn/',
				summary: 'Dashbord og nøkkeltall for ledere i barneverntjenesten.',
				description:
					'Følg frister, saksmengde og tiltak per enhet, og hent ut rapporter til ledermøter og rapportering med noen få klikk.',
				priceNok: 38000,
				priceUnit: 'per år',
				isNew: true
			},
			{
				categoryId: pc.integrasjoner,
				name: 'Arkivintegrasjon (Noark 5)',
				slug: 'arkivintegrasjon-noark-5',
				summary: 'Arkiver dokumenter automatisk i kommunens sak/arkiv-system.',
				description:
					'Støtter Noark 5-baserte arkivsystemer. Prisen avhenger av arkivleverandør og oppsett.',
				priceNok: null,
				priceUnit: null
			},
			{
				categoryId: pc.integrasjoner,
				name: 'KS SvarUt og SvarInn',
				slug: 'svarut-svarinn',
				summary: 'Send og motta digital post gjennom KS FIKS.',
				description:
					'Send brev digitalt til innbyggere og virksomheter, og få svarene rett inn i saken.',
				priceNok: 18000,
				priceUnit: 'per år'
			},
			{
				categoryId: pc.integrasjoner,
				name: 'Økonomiintegrasjon',
				slug: 'okonomiintegrasjon',
				summary: 'Overfør utbetalinger og tiltakskostnader til økonomisystemet.',
				description:
					'Unngå dobbeltregistrering ved å sende utbetalinger og kostnader for tiltak direkte til kommunens økonomisystem.',
				priceNok: 22000,
				priceUnit: 'per år'
			},
			{
				categoryId: pc['innforing-og-migrering'],
				name: 'Innføringspakke for nye kommuner',
				slug: 'innforingspakke',
				orderUrl: 'https://netcompany.com/digibarnevern-modulus-barn/',
				summary: 'Prosjektledelse, oppsett og opplæring fra start til drift.',
				description:
					'Vi følger dere gjennom hele innføringen: planlegging, konfigurasjon, opplæring av superbrukere og oppfølging de første månedene i drift.',
				priceNok: null,
				priceUnit: null
			},
			{
				categoryId: pc['innforing-og-migrering'],
				name: 'Datamigrering',
				slug: 'datamigrering',
				summary: 'Vi flytter historikken fra dagens fagsystem trygt over.',
				description:
					'Kartlegging, testmigrering og endelig overføring med kvalitetskontroll underveis.',
				priceNok: null,
				priceUnit: null
			},
			{
				categoryId: pc['kurs-og-opplaering'],
				name: 'Grunnkurs i Modulus Barn',
				slug: 'grunnkurs',
				summary: 'Heldagskurs i daglig bruk av løsningen.',
				description:
					'Praktisk kurs med øvingsoppgaver for nye saksbehandlere. Holdes digitalt eller hos dere.',
				priceNok: 4900,
				priceUnit: 'per deltaker'
			},
			{
				categoryId: pc['kurs-og-opplaering'],
				name: 'Superbrukerkurs',
				slug: 'superbrukerkurs',
				summary: 'For dere som skal hjelpe kollegaer og administrere oppsett.',
				description:
					'To dager med oppsett, maler, tilganger og feilsøking. Anbefales for minst én person per team.',
				priceNok: 7900,
				priceUnit: 'per deltaker',
				isNew: true
			},
			{
				categoryId: pc['kurs-og-opplaering'],
				name: 'BFK i praksis',
				slug: 'bfk-i-praksis',
				summary: 'Halvdagskurs i barnevernfaglig kvalitetssystem i saksarbeidet.',
				description:
					'Hvordan BFK gir faglig og juridisk støtte gjennom alle faser av en barnevernssak, med eksempler fra kommuner som bruker det i dag.',
				priceNok: 3500,
				priceUnit: 'per deltaker'
			},
			{
				categoryId: pc['brukerstotte-og-tjenester'],
				name: 'Utvidet brukerstøtte',
				slug: 'utvidet-brukerstotte',
				summary: 'Telefonstøtte 08–20 og egen kontaktperson.',
				description: 'Raskere responstid, egen kontaktperson og faste statusmøter hvert kvartal.',
				priceNok: 30000,
				priceUnit: 'per år'
			}
		])
		.returning();

	await db.insert(s.post).values([
		{
			kind: 'ad',
			title: 'Ny modul: Digitale innbyggertjenester',
			slug: 'ny-modul-digitale-innbyggertjenester',
			excerpt:
				'Gi barn og familier innsyn og digital dialog. Nå tilgjengelig for alle kommuner som bruker Modulus Barn.',
			body: 'Med digitale innbyggertjenester kan barn, unge og familier se status i egen sak og sende og motta dokumenter digitalt.\n\nModulen rulles ut gradvis. Bruk bestillingslenken på modulsiden, så tar vi kontakt om oppstart.',
			ctaLabel: 'Se modulen',
			ctaUrl: '/produkter/digitale-innbyggertjenester',
			published: true,
			pinned: true,
			authorId: u.admin,
			publishedAt: daysAgo(1)
		},
		{
			kind: 'ad',
			title: 'Kursdager våren 2027',
			slug: 'kursdager-varen-2027',
			excerpt: 'Grunnkurs, superbrukerkurs og BFK i praksis i Oslo, Bergen, Trondheim og Tromsø.',
			body: 'Meld på saksbehandlere og superbrukere. Ta kontakt for datoer og påmelding.',
			ctaLabel: 'Se kursene',
			ctaUrl: '/produkter?kategori=kurs-og-opplaering',
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
			kind: 'ops',
			title: 'Planlagt vedlikehold 14. november kl. 22–24',
			slug: 'planlagt-vedlikehold-14-november',
			excerpt: 'Modulus Barn er utilgjengelig i to timer mens vi oppgraderer driftsplattformen.',
			body: 'Vi oppgraderer driftsplattformen torsdag 14. november kl. 22–24. Modulus Barn er utilgjengelig i dette tidsrommet.\n\nLagre arbeidet ditt før kl. 22. Kommuneportalen er tilgjengelig som vanlig.',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(3)
		},
		{
			kind: 'news',
			title: 'Modulus Barn er nå i bruk i 157 kommuner',
			slug: 'modulus-barn-157-kommuner',
			excerpt:
				'Løsningen fra DigiBarnevern er på vei til å bli nasjonal standard, med over 160 kommuner i løpet av 2026.',
			body: 'DigiBarnevern ble startet i 2016 av Bufdir, KS og åtte av landets største kommuner. I dag bruker 157 kommuner Modulus Barn, og over 3000 barnevernsansatte jobber i løsningen.\n\nI løpet av 2026 passerer vi 160 kommuner, som til sammen dekker mer enn halvparten av befolkningen. Takk til alle som deler erfaringer og ønsker. Det er dere som former veien videre.',
			published: true,
			authorId: u.admin,
			publishedAt: daysAgo(6)
		},
		{
			kind: 'release',
			title: 'Nye maler i BFK for undersøkelsesfasen',
			slug: 'nye-maler-bfk-undersokelse',
			excerpt:
				'Oppdaterte maler for undersøkelsesplan og konklusjon, utarbeidet sammen med kommunene.',
			body: 'Malene for undersøkelsesplan og konklusjon i BFK er oppdatert etter innspill fra kommunene i forumet. De nye malene er tilgjengelige for alle fra i dag.',
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
		author: string;
		kommune: string;
		category: string | null;
		title: string;
		description: string;
		status: 'new' | 'reviewing' | 'planned' | 'done' | 'declined';
		adminNote?: string;
		age: number;
	}[] = [
		{
			author: 'kari',
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
			author: 'kari',
			kommune: 'Bergen',
			category: 'Rapportering og styringsdata',
			title: 'Eksport av fristoversikten til Excel',
			description: 'Ledergruppen vil gjerne ha fristoversikten som regneark før møtene.',
			status: 'new',
			age: 2
		},
		{
			author: 'ola',
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
			author: 'ola',
			kommune: 'Tromsø',
			category: null,
			title: 'Varsel når en sak overføres til min enhet',
			description: 'I dag oppdager vi overførte saker først når vi åpner saksoversikten.',
			status: 'new',
			age: 1
		},
		{
			author: 'sara',
			kommune: 'Trondheim',
			category: 'Brukervennlighet',
			title: 'Mørk modus i saksbehandlingen',
			description: 'Flere hos oss jobber lange dager foran skjermen og ønsker et mørkt tema.',
			status: 'declined',
			adminNote: 'Ikke prioritert for 2027, men ønsket er notert.',
			age: 30
		},
		{
			author: 'jonas',
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
			authorId: u[w.author],
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
		`Seeded ${kommuner.length} kommuner, ${users.length} users, ${threads.length} threads, ${products.length} products, ${wishes.length} wishes.`
	);
	console.log(
		`Demo login: admin@kommuneportalen.no / kari.nordmann@bergen.kommune.no, password "${DEMO_PASSWORD}"`
	);
}

try {
	await main();
} finally {
	await client.end();
}
