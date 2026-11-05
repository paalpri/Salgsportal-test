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
				['Tromsø', '5501', 'Troms', 'tromso.kommune.no'],
				['Kristiansand', '4204', 'Agder', 'kristiansand.kommune.no'],
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
			name: 'Ingrid Admin',
			email: 'admin@kommuneportalen.no',
			role: 'admin',
			municipalityId: null,
			jobTitle: 'Kundeansvarlig'
		},
		{
			name: 'Kari Nordmann',
			email: 'kari.nordmann@bergen.kommune.no',
			role: 'user',
			municipalityId: k.Bergen,
			jobTitle: 'Barnevernleder'
		},
		{
			name: 'Ola Hansen',
			email: 'ola.hansen@tromso.kommune.no',
			role: 'user',
			municipalityId: k['Tromsø'],
			jobTitle: 'Saksbehandler'
		},
		{
			name: 'Sara Berg',
			email: 'sara.berg@trondheim.kommune.no',
			role: 'user',
			municipalityId: k.Trondheim,
			jobTitle: 'Fagkonsulent'
		},
		{
			name: 'Jonas Lie',
			email: 'jonas.lie@bodo.kommune.no',
			role: 'user',
			municipalityId: k['Bodø'],
			jobTitle: 'Systemansvarlig'
		}
	];
	const users = await db
		.insert(s.user)
		.values(people.map((p) => ({ ...p, id: crypto.randomUUID(), emailVerified: true })))
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
	const [admin, kari, ola, sara, jonas] = users.map((u) => u.id);

	const categories = await db
		.insert(s.forumCategory)
		.values([
			{
				name: 'Spørsmål og svar',
				slug: 'sporsmal-og-svar',
				description: 'Still spørsmål om bruk av systemet.',
				sortOrder: 1
			},
			{
				name: 'Rutiner og maler',
				slug: 'rutiner-og-maler',
				description: 'Del maler, rutiner og god praksis.',
				sortOrder: 2
			},
			{
				name: 'Integrasjoner',
				slug: 'integrasjoner',
				description: 'Folkeregister, SvarUt, arkiv og andre fagsystemer.',
				sortOrder: 3
			},
			{
				name: 'Opplæring',
				slug: 'opplaering',
				description: 'Kurs, onboarding og kompetanse.',
				sortOrder: 4
			},
			{
				name: 'Ønsker og forslag',
				slug: 'onsker-og-forslag',
				description: 'Forslag til ny funksjonalitet.',
				sortOrder: 5
			}
		])
		.returning();
	const c = Object.fromEntries(categories.map((cat) => [cat.slug, cat.id]));

	const threads: {
		categoryId: number;
		authorId: string;
		title: string;
		body: string;
		age: number;
		pinned?: boolean;
		locked?: boolean;
		replies: { authorId: string; body: string; accepted?: boolean }[];
	}[] = [
		{
			categoryId: c['sporsmal-og-svar'],
			authorId: admin,
			title: 'Velkommen til forumet – les dette først',
			body: 'Her kan ansatte i kommunene hjelpe hverandre med spørsmål om barnevernssystemet.\n\nHusk: Ikke del personopplysninger eller detaljer fra enkeltsaker i forumet. Bruk generelle eksempler.',
			age: 30,
			pinned: true,
			locked: true,
			replies: []
		},
		{
			categoryId: c['sporsmal-og-svar'],
			authorId: ola,
			title: 'Hvordan setter dere opp fristvarsler for undersøkelsessaker?',
			body: 'Vi ønsker varsel to uker før fristen går ut, men får bare varsel samme dag. Er det noen som har fått til dette?',
			age: 3,
			replies: [
				{
					authorId: kari,
					body: 'Gå til Innstillinger → Frister → Varsling og legg inn «14 dager før» som ekstra varsel. Det må gjøres per enhet.',
					accepted: true
				},
				{
					authorId: sara,
					body: 'Vi gjorde det samme i Trondheim. Husk å lagre én gang per enhet, ellers gjelder det bare din egen.'
				},
				{ authorId: ola, body: 'Takk begge to, det fungerte!' }
			]
		},
		{
			categoryId: c['rutiner-og-maler'],
			authorId: kari,
			title: 'Mal for tiltaksplan – deler gjerne vår',
			body: 'Vi har laget en ny mal for tiltaksplan med tydeligere mål og evalueringspunkter. Si fra om dere vil ha den, så legger jeg den ut i maldelingen.',
			age: 6,
			replies: [{ authorId: jonas, body: 'Ja takk! Vi holder på å revidere våre maler nå.' }]
		},
		{
			categoryId: c.integrasjoner,
			authorId: jonas,
			title: 'Erfaringer med integrasjon mot SvarUt?',
			body: 'Vi vurderer SvarUt-integrasjonen. Hvor lang tid tok oppsettet hos dere, og trengte dere hjelp fra IT?',
			age: 9,
			replies: [
				{
					authorId: sara,
					body: 'Oppsettet tok et par dager. Vi trengte IT til sertifikatet, resten gjorde vi selv.'
				}
			]
		},
		{
			categoryId: c['onsker-og-forslag'],
			authorId: sara,
			title: 'Ønske: bedre oversikt over samværsavtaler',
			body: 'Det hadde vært fint med en samlet oversikt over alle aktive samværsavtaler per enhet, med filter på dato.',
			age: 12,
			replies: [
				{
					authorId: admin,
					body: 'Takk for forslaget! Dette er med i planleggingen av neste versjon.'
				}
			]
		}
	];

	for (const t of threads) {
		const created = daysAgo(t.age);
		const [thread] = await db
			.insert(s.forumThread)
			.values({
				categoryId: t.categoryId,
				authorId: t.authorId,
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
				.values({ threadId: thread.id, authorId: r.authorId, body: r.body, createdAt: last })
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
				description: 'Funksjonalitet i barnevernssystemet.',
				sortOrder: 1
			},
			{
				name: 'Integrasjoner',
				slug: 'integrasjoner',
				description: 'Koble systemet til andre løsninger.',
				sortOrder: 2
			},
			{
				name: 'Kurs og opplæring',
				slug: 'kurs-og-opplaering',
				description: 'Kurs for saksbehandlere og superbrukere.',
				sortOrder: 3
			},
			{
				name: 'Tjenester',
				slug: 'tjenester',
				description: 'Rådgivning, migrering og support.',
				sortOrder: 4
			}
		])
		.returning();
	const pc = Object.fromEntries(productCategories.map((cat) => [cat.slug, cat.id]));

	const products = await db
		.insert(s.product)
		.values([
			{
				categoryId: pc.moduler,
				name: 'Barnevern Kjerne',
				slug: 'barnevern-kjerne',
				summary: 'Saksbehandling, journal og fristoppfølging i én løsning.',
				description:
					'Kjernemodulen dekker hele saksløpet fra bekymringsmelding til tiltak og evaluering. Inkluderer journalføring, dokumentproduksjon, fristoppfølging og tilgangsstyring.',
				priceNok: 185000,
				priceUnit: 'per år'
			},
			{
				categoryId: pc.moduler,
				name: 'Mobil saksbehandling',
				slug: 'mobil-saksbehandling',
				summary: 'Gjør hjemmebesøk og samtaler enklere fra nettbrett og mobil.',
				description:
					'Skriv notater, ta signaturer og se saksinformasjon på farten. Data lagres kryptert og synkroniseres når du er tilkoblet.',
				priceNok: 45000,
				priceUnit: 'per år',
				isNew: true
			},
			{
				categoryId: pc.moduler,
				name: 'Innsikt og rapportering',
				slug: 'innsikt-og-rapportering',
				summary: 'Dashbord, nøkkeltall og KOSTRA-rapportering.',
				description:
					'Få oversikt over frister, saksmengde og tiltak per enhet, og lever KOSTRA-rapportering med noen få klikk.',
				priceNok: 38000,
				priceUnit: 'per år',
				isNew: true
			},
			{
				categoryId: pc.integrasjoner,
				name: 'Folkeregister-integrasjon',
				slug: 'folkeregister-integrasjon',
				summary: 'Automatisk oppslag og oppdatering mot Folkeregisteret.',
				description:
					'Hent og oppdater personopplysninger direkte fra Folkeregisteret, med logging av alle oppslag.',
				priceNok: 25000,
				priceUnit: 'per år'
			},
			{
				categoryId: pc.integrasjoner,
				name: 'SvarUt/SvarInn',
				slug: 'svarut-svarinn',
				summary: 'Send og motta digital post gjennom KS FIKS.',
				description:
					'Send brev digitalt til innbyggere og virksomheter, og motta svar rett i saken.',
				priceNok: 18000,
				priceUnit: 'per år'
			},
			{
				categoryId: pc.integrasjoner,
				name: 'Arkivintegrasjon (Noark 5)',
				slug: 'arkivintegrasjon-noark-5',
				summary: 'Arkiver dokumenter automatisk i kommunens sak/arkiv-system.',
				description: 'Støtter Noark 5-baserte arkivsystemer. Pris avhenger av arkivleverandør.',
				priceNok: null,
				priceUnit: null
			},
			{
				categoryId: pc['kurs-og-opplaering'],
				name: 'Grunnopplæring for saksbehandlere',
				slug: 'kurs-grunnopplaering',
				summary: 'Heldagskurs i daglig bruk av systemet.',
				description: 'Praktisk kurs med øvingsoppgaver. Holdes digitalt eller hos dere.',
				priceNok: 4900,
				priceUnit: 'per deltaker'
			},
			{
				categoryId: pc['kurs-og-opplaering'],
				name: 'Superbrukerkurs',
				slug: 'superbrukerkurs',
				summary: 'For dere som skal hjelpe kollegaer og administrere oppsett.',
				description: 'To dager med fokus på oppsett, maler, tilganger og feilsøking.',
				priceNok: 7900,
				priceUnit: 'per deltaker',
				isNew: true
			},
			{
				categoryId: pc.tjenester,
				name: 'Migrering fra eksisterende system',
				slug: 'migrering',
				summary: 'Vi flytter historikken deres trygt over.',
				description: 'Kartlegging, testmigrering og endelig overføring med kvalitetskontroll.',
				priceNok: null,
				priceUnit: null
			},
			{
				categoryId: pc.tjenester,
				name: 'Utvidet support',
				slug: 'utvidet-support',
				summary: 'Telefonsupport 08–20 og egen kontaktperson.',
				description: 'Raskere responstid, egen kontaktperson og kvartalsvise statusmøter.',
				priceNok: 30000,
				priceUnit: 'per år'
			}
		])
		.returning();
	const p = Object.fromEntries(products.map((prod) => [prod.slug, prod]));

	await db.insert(s.post).values([
		{
			kind: 'ad',
			title: 'Ny modul: Mobil saksbehandling',
			slug: 'ny-modul-mobil-saksbehandling',
			excerpt: 'Gjør hjemmebesøk og samtaler enklere – 20 % introduksjonsrabatt ut året.',
			body: 'Mobil saksbehandling lar dere skrive notater, ta signaturer og se saksinformasjon på nettbrett og mobil.\n\nBestiller dere før nyttår, får dere 20 % rabatt første år.',
			ctaLabel: 'Se modulen',
			ctaUrl: '/produkter/mobil-saksbehandling',
			published: true,
			pinned: true,
			authorId: admin,
			publishedAt: daysAgo(1)
		},
		{
			kind: 'ad',
			title: 'Kursdager våren 2027',
			slug: 'kursdager-varen-2027',
			excerpt: 'Meld på saksbehandlere til praktiske kurs i Oslo, Bergen og Trondheim.',
			body: 'Vi arrangerer grunnopplæring og superbrukerkurs i tre byer. Legg kurset i handlelisten med antall deltakere, så tar vi kontakt.',
			ctaLabel: 'Se kurs',
			ctaUrl: '/produkter/kurs-grunnopplaering',
			published: true,
			authorId: admin,
			publishedAt: daysAgo(4)
		},
		{
			kind: 'news',
			title: 'Versjon 4.2 er rullet ut',
			slug: 'versjon-4-2',
			excerpt: 'Raskere søk, nye fristvarsler og forbedret dokumentproduksjon.',
			body: 'Versjon 4.2 er nå tilgjengelig for alle kommuner.\n\nNyheter:\n• Søket er opptil tre ganger raskere\n• Fristvarsler kan settes flere dager før fristen\n• Dokumentmaler støtter nå flere flettefelt',
			published: true,
			authorId: admin,
			publishedAt: daysAgo(2)
		},
		{
			kind: 'news',
			title: 'Endringer i barnevernsloven – slik er systemet oppdatert',
			slug: 'endringer-i-barnevernsloven',
			excerpt: 'Oversikt over endringene og hva de betyr for dere som bruker systemet.',
			body: 'Vi har oppdatert maler, frister og rapporter i tråd med regelverksendringene. Se brukerveiledningen for detaljer.',
			published: true,
			authorId: admin,
			publishedAt: daysAgo(10)
		},
		{
			kind: 'news',
			title: 'Planlagt vedlikehold 14. november',
			slug: 'planlagt-vedlikehold-14-november',
			excerpt: 'Systemet er utilgjengelig kl. 22–24 på grunn av oppgradering.',
			body: 'Vi oppgraderer driftsplattformen. Lagre arbeidet ditt før kl. 22.',
			published: true,
			authorId: admin,
			publishedAt: daysAgo(5)
		},
		{
			kind: 'news',
			title: 'Utkast: Brukerundersøkelse 2027',
			slug: 'brukerundersokelse-2027',
			excerpt: 'Hjelp oss å bli bedre.',
			body: 'Utkast – ikke publisert.',
			published: false,
			authorId: admin
		}
	]);

	await db.insert(s.cartItem).values([
		{
			municipalityId: k.Bergen,
			productId: p['mobil-saksbehandling'].id,
			quantity: 1,
			addedById: kari
		},
		{
			municipalityId: k.Bergen,
			productId: p['kurs-grunnopplaering'].id,
			quantity: 6,
			note: 'Nye saksbehandlere fra januar',
			addedById: kari
		}
	]);

	const requests = [
		{
			municipalityId: k['Tromsø'],
			submittedById: ola,
			status: 'new' as const,
			message: 'Ønsker tilbud på superbrukerkurs for to personer i februar.',
			items: [[p.superbrukerkurs, 2]] as const,
			age: 1
		},
		{
			municipalityId: k.Trondheim,
			submittedById: sara,
			status: 'answered' as const,
			message: 'Vi vurderer rapporteringsmodulen.',
			items: [
				[p['innsikt-og-rapportering'], 1],
				[p['utvidet-support'], 1]
			] as const,
			age: 8,
			adminNote: 'Tilbud sendt på e-post.'
		}
	];
	for (const r of requests) {
		const [req] = await db
			.insert(s.quoteRequest)
			.values({
				municipalityId: r.municipalityId,
				submittedById: r.submittedById,
				status: r.status,
				message: r.message,
				adminNote: r.adminNote ?? '',
				createdAt: daysAgo(r.age)
			})
			.returning();
		await db.insert(s.quoteRequestItem).values(
			r.items.map(([prod, quantity]) => ({
				requestId: req.id,
				productId: prod.id,
				productName: prod.name,
				unitPriceNok: prod.priceNok,
				priceUnit: prod.priceUnit,
				quantity
			}))
		);
	}

	console.log(
		`Seeded ${kommuner.length} kommuner, ${users.length} users, ${threads.length} threads, ${products.length} products.`
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
