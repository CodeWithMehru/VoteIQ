import { test, expect } from '@playwright/test';

test('End-to-End Voting Journey Simulation', async ({ page }) => {
  await page.goto('/');

  // Educational Alignment Verification
  await expect(page.locator('text=First-Time Voter Educational Guide')).toBeVisible();

  // 1. Accessibility & Auth Flow
  await page.fill('input[name="new-password"]', 'Jane Doe');
  await page.fill('input[placeholder="ABC1234567"]', 'E2E-TEST-999');
  await page.click('button:has-text("Verify & Proceed")');

  // 2. EVM Ballot Verification
  await expect(page.locator('text=Digital Ballot')).toBeVisible();

  // 3. Vote Action via ARIA Label
  await page.click('button[aria-label="Vote for Candidate X of Party A"]');

  // 4. Digital VVPAT Verification
  await expect(page.locator('text=Official Receipt')).toBeVisible();
  await expect(page.locator('text=Verifiability Hash')).toBeVisible();
});
