import { test, expect } from 'src/fixtures';
import { JsonHandling } from 'src/utilities';

test.describe('Authentication API', () => {
  test('obtain access token with valid credentials', async ({ authenticationService }, testInfo) => {
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;

    testInfo.skip(!username || !password, 'API credentials not configured in environment');

    const token = await authenticationService.getAuthToken(username!, password!);
    console.log("REsponse - Token: " + token);
    //JsonHandling.parseJsonTextToObject(token); // Validate token is valid JSON (if applicable)
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

});
