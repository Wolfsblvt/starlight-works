import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync(new URL('./artifacts/consumer.json', import.meta.url), 'utf8'));
const baseURL = `http://127.0.0.1:4321${state.base.endsWith('/') ? state.base : state.base + '/'}`;
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }], ['json', { outputFile: 'artifacts/browser-results.json' }]],
  outputDir: 'artifacts/browser-output',
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'node tools/serve.mjs preview', url: baseURL, reuseExistingServer: false, timeout: 60000 },
});
