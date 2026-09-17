const { test, expect } = require('@playwright/test');

test('language selector updates critical marketplace text and survives refresh', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const selector = page.getByLabel('Select language');
  await expect(selector).toBeVisible();
  await selector.selectOption('tr');
  await expect(page.getByText('Pazarı keşfet')).toBeVisible();
  await expect(page.getByText('Sepete ekle').first()).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(selector).toHaveValue('tr');
  await expect(page.getByText('Pazarı keşfet')).toBeVisible();
});

test('language selector covers Spanish, German, and Simplified Chinese', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const selector = page.getByLabel('Select language');
  for (const [locale, text] of [['es', 'Explorar mercado'], ['de', 'Markt entdecken'], ['zh-CN', '探索市场']]) {
    await selector.selectOption(locale);
    await expect(page.getByText(text)).toBeVisible();
  }
});
