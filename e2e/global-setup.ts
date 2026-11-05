import { execSync } from 'node:child_process';
import postgres from 'postgres';

/** Recreates the test database from migrations and seed data, so runs never touch dev data. */
export default async function globalSetup() {
	const url = new URL(process.env.TEST_DATABASE_URL!);
	const name = url.pathname.slice(1);
	const maintenance = new URL(url);
	maintenance.pathname = '/postgres';

	const sql = postgres(maintenance.href, { max: 1, onnotice: () => {} });
	await sql.unsafe(`drop database if exists "${name}" with (force)`);
	await sql.unsafe(`create database "${name}"`);
	await sql.end();

	const env = { ...process.env, DATABASE_URL: url.href };
	execSync('pnpm db:migrate', { env, stdio: 'ignore' });
	execSync('node scripts/seed.ts', { env, stdio: 'inherit' });
}
