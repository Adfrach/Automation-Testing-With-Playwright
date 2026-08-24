import { test as base, expect, request as playwrightRequest, APIRequestContext } from '@playwright/test';
import path from 'node:path';

/**
 * Fixture `apiRequest` untuk mode API.
 * Menyediakan request context yang reusable dengan storageState (jika ada).
 */
export const test = base.extend<{ apiRequest: APIRequestContext }>({
  apiRequest: async ({}, use) => {
    const ctx = await playwrightRequest.newContext({
      baseURL:
        process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',
      // Optionally load storageState if present (auth session from UI login)
      storageState: process.env.AUTH_STATE
        ? path.resolve(process.env.AUTH_STATE)
        : undefined,
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect };