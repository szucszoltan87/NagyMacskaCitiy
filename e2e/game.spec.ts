import { expect, test } from '@playwright/test';

test('saját macska építése, és újratöltés után is megvan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('1. nap')).toBeVisible();
  await page.getByRole('button', { name: /Új macska/ }).click();
  await page.getByRole('button', { name: 'Tigris', exact: true }).click();
  await page.getByPlaceholder('Név').fill('Teszt Tigris');
  await page.getByRole('button', { name: /Kész/ }).click();
  await expect(page.getByText('Megérkezett: Teszt Tigris! 🎉')).toBeVisible();
  await page.waitForTimeout(4000); // automatikus mentés 3 mp-enként
  await page.reload();
  await page.getByRole('button', { name: /Macskáim/ }).click();
  await expect(page.getByText('Teszt Tigris')).toBeVisible();
});

test('vásárlás a boltban', async ({ page }) => {
  await page.goto('/');
  await page.getByText('🛒 Bolt').first().click();
  await expect(page.getByText(/koppints, amit megveszel/)).toBeVisible();
  await page.getByRole('button', { name: /Répa/ }).click();
  await expect(page.getByText('Megvetted: 🥕 Répa')).toBeVisible();
});
