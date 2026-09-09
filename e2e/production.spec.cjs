const { test, expect } = require('@playwright/test');

const liveDomains = [
  'https://vivoamigo.com',
  'https://payvivoamigo.com',
  'https://cargovivo.com'
];

const creditCalculatorUrl = process.env.E2E_CREDIT_CALCULATOR_URL || 'https://vivoamigo.com/listings/e2e-credit-calculator';

test.describe('production availability', () => {
  for (const domain of liveDomains) {
    test(`${domain} responds with HTTP 200`, async ({ request }) => {
      const response = await request.get(domain, { failOnStatusCode: false });
      expect(response.status(), `${domain} must be available`).toBe(200);
    });
  }
});

test('renders the bank credit calculator for a financed listing', async ({ page }) => {
  await page.goto(creditCalculatorUrl, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Calculadora de Crédito Bancario' })).toBeVisible();
  await expect(page.locator('#credit-down-payment')).toHaveValue('20');
  await expect(page.locator('#credit-term')).toHaveValue('20');
  await expect(page.getByText(/Cuota Mensual Estimada:/)).toBeVisible();
  await expect(page.getByText(/Q\d+\.\d{2} \/ mes/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pre-Calificar Crédito en Línea' })).toBeVisible();
});
