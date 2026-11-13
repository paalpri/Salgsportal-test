import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (existsSync('.env')) process.loadEnvFile('.env');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const testDatabase = new URL(process.env.DATABASE_URL);
testDatabase.pathname = '/kommuneportal_test';
process.env.TEST_DATABASE_URL = testDatabase.href;

const port = 4173;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	globalSetup: './e2e/global-setup.ts',
	workers: 1,
	use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
	webServer: {
		command: `pnpm build && pnpm preview --port ${port} --strictPort`,
		port,
		env: {
			ORIGIN: `http://localhost:${port}`,
			DATABASE_URL: testDatabase.href,
			DEMO_LOGIN: 'true'
		},
		reuseExistingServer: false
	}
});
