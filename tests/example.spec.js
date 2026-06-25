// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';

//Answer: Daniel Golan



// Test Data
const TEST_DATA = {
  name:     'John Summit',
  email:    'john.summit@testmail.com',
  phone:    '+1-987-775-6590',
  company:  'Jones',
  website:  'https://getjones.com/',
};

const INVALID_URLS = [
  'getjones',              // no protocol, no extension
  'getjones.com',          // no protocol
  'https://getjones',      // no extension
  'https://get jones.com', // space in URL
];

const INVALID_EMAILS = [
  'johngmail.com',    // missing @
  'john@',           // missing domain
  'john@gmail',      // missing extension
  '@gmail.com',      // missing local part
];

const INVALID_PHONES = [
  'abcdefghij',      // letters only
  '123',             // too short
  '123-abc-4567',    // mix of letters and numbers
  '!@#$%^&*()',      // special characters only
];

test('Form filling', async ({ page }) => {
  await page.goto('https://test.netlify.app/');
  console.log("Page loaded");

  // Fill info
  await fillAllExcept("fillAll",page);

  //Screenshot BEFORE submit
  const screenshotPath = path.join(__dirname, 'screenshot_before_submit.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved : ${screenshotPath}`);

  // Click "Request a call back"
  console.log('Clicking "Request a call back"');
  await page.getByRole('button', { name: 'Request a call back' }).click();


  // Wait for Thank You page
  //log secsess
  await expect(page).toHaveURL(/thank-you\.html/);
  console.log('Reached the Thank You page!');
});


test('Email validation', async ({ page }) => {
  await page.goto('https://test.netlify.app/');

  // Fill all other fields first except email
  await fillAllExcept("email",page);

  // Test all invalid emails
  for (const email of INVALID_EMAILS) {
    await page.locator('#email').fill(email);
    await page.getByRole('button', { name: 'Request a call back' }).click();

    console.log(page.url());
    const validation = await page.locator('#email').evaluate(
      el => /** @type {HTMLInputElement} */ (el).validationMessage
    );
    console.log(`Email: "${email}" → "${validation}"`);
    expect(validation).not.toBe('');
  }

  // Fill with valid email and submit
  await page.locator('#email').fill(TEST_DATA.email);
  console.log(`Email: "${TEST_DATA.email}"`);
  await page.getByRole('button', { name: 'Request a call back' }).click();

  await expect(page).toHaveURL(/thank-you\.html/);
  console.log('Reached the Thank You page!');
});

test('Website URL validation', async ({ page }) => {
  await page.goto('https://test.netlify.app/');

  // Fill all other fields first except website
  await fillAllExcept("website", page);

  // Test all invalid URLs
  for (const url of INVALID_URLS) {
    await page.locator('#website').fill(url);
    await page.getByRole('button', { name: 'Request a call back' }).click();

    console.log(page.url());
    const validation = await page.locator('#website').evaluate(
      el => /** @type {HTMLInputElement} */ (el).validationMessage
    );
    console.log(`URL: "${url}" → "${validation}"`);
    expect(validation).not.toBe(''); // should have an error message
  }

  // Fill with valid URL and submit
  await page.locator('#website').fill(TEST_DATA.website);
  await page.getByRole('button', { name: 'Request a call back' }).click();

  await expect(page).toHaveURL(/thank-you\.html/);
  console.log('Reached the Thank You page!');
});

test('Label floats when input is clicked', async ({ page }) => {
  await page.goto('https://test.netlify.app/');

  const labelBefore = await page.locator('#name ~ label').boundingBox();
  if (!labelBefore) throw new Error('Label not found before click');
  console.log('Label X before click:', labelBefore.x);

  await page.locator('#name').click();
  await page.waitForTimeout(400);

  const labelAfter = await page.locator('#name ~ label').boundingBox();
  if (!labelAfter) throw new Error('Label not found after click');
  console.log('Label X after click:', labelAfter.x);

  // 1. Check label moved left by ~80px
  expect(labelAfter.x).toBeLessThan(labelBefore.x - 70);
  console.log(`Label moved left: ${labelBefore.x - labelAfter.x}px`);

  // 2. Check background color changed to green
  const bgColor = await page.locator('#name ~ label').evaluate(
    el => getComputedStyle(el).backgroundColor
  );
  console.log('Background color:', bgColor);
   expect(bgColor).toBe('rgb(122, 184, 147)');

  // 3. Check text color changed to white
  const textColor = await page.locator('#name ~ label').evaluate(
    el => getComputedStyle(el).color
  );
  console.log('Text color:', textColor);
  expect(textColor).toBe('rgb(255, 255, 255)');
});

test('Required fields validation in order', async ({ page }) => {
  await page.goto('https://test.netlify.app/');

  // 1. Everything empty - Name should error
  await page.getByRole('button', { name: 'Request a call back' }).click();
  const nameValidation = await page.locator('#name').evaluate(
    el => /** @type {HTMLInputElement} */ (el).validationMessage
  );
  console.log(`Name empty → "${nameValidation}"`);
  expect(nameValidation).not.toBe('');

  // 2. Fill Name - Email should error
  await page.locator('#name').fill(TEST_DATA.name);
  await page.getByRole('button', { name: 'Request a call back' }).click();
  const emailValidation = await page.locator('#email').evaluate(
    el => /** @type {HTMLInputElement} */ (el).validationMessage
  );
  console.log(`Email empty → "${emailValidation}"`);
  expect(emailValidation).not.toBe('');

  // 3. Fill Email - Phone should error
  await page.locator('#email').fill(TEST_DATA.email);
  await page.getByRole('button', { name: 'Request a call back' }).click();
  const phoneValidation = await page.locator('#phone').evaluate(
    el => /** @type {HTMLInputElement} */ (el).validationMessage
  );
  console.log(`Phone empty → "${phoneValidation}"`);
  expect(phoneValidation).not.toBe('');


  // 4. Fill Phone - form should submit (company/website are optional)
  await page.locator('#phone').fill(TEST_DATA.phone);
  await page.getByRole('button', { name: 'Request a call back' }).click();
  await expect(page).toHaveURL(/thank-you\.html/);
  console.log('Reached the Thank You page!');
});

test('Phone validation', async ({ page }) => {
  await page.goto('https://test.netlify.app/');

  // Fill all other fields first except phone
  await fillAllExcept("phone", page);

  // Test all invalid phones
  for (const phone of INVALID_PHONES) {
    await page.locator('#phone').fill(phone);
    await page.getByRole('button', { name: 'Request a call back' }).click();

    console.log(page.url());
    const validation = await page.locator('#phone').evaluate(
      el => /** @type {HTMLInputElement} */ (el).validationMessage
    );
    console.log(`Phone: "${phone}" → "${validation}"`);
    expect(validation).not.toBe('');
  }

  // Fill with valid phone and submit
  await page.locator('#phone').fill(TEST_DATA.phone);
  await page.getByRole('button', { name: 'Request a call back' }).click();

  await expect(page).toHaveURL(/thank-you\.html/);
  console.log('Reached the Thank You page!');
});

/**
 * @param {string} fieldToSkip
 * @param {import('@playwright/test').Page} page
 */
async function fillAllExcept(fieldToSkip, page) {
  if (fieldToSkip !== 'name'){
          await page.locator('#name').fill(TEST_DATA.name);
          console.log(`Name : "${TEST_DATA.name}"`);
  }
    
  if (fieldToSkip !== 'email'){
    await page.locator('#email').fill(TEST_DATA.email);
    console.log(`Email : "${TEST_DATA.email}"`);
  }
  if (fieldToSkip !== 'phone'){
    await page.locator('#phone').fill(TEST_DATA.phone);
    console.log(`Phone : "${TEST_DATA.phone}"`);
  }
  if (fieldToSkip !== 'company'){
    await page.locator('#company').fill(TEST_DATA.company);
    console.log(`Company : "${TEST_DATA.company}"`);
  }
  if (fieldToSkip !== 'website'){
    await page.locator('#website').fill(TEST_DATA.website);
    console.log(`Website : "${TEST_DATA.website}"`);
  }
  if (fieldToSkip !== 'employees'){
    await page.locator('#employees').selectOption('51-500');
    console.log(`Employees : "51-500"`);
  }
}
