import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, fullPage = false) {
  const filePath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage });
  console.log(`📸 Screenshot saved: ${filePath}`);
}

async function testUI() {
  console.log('🚀 Starting Web3 Jobs UI/UX Testing');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  try {
    console.log('🔍 Test 1: Navigate to main interface and take screenshots');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'main-page-full', true);
    await takeScreenshot(page, 'main-page-viewport');

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Look for key elements
    const searchInput = await page.$('input[placeholder*="search"], input[type="search"], .search-input');
    const jobCards = await page.$$('.job-card, [data-testid="job-card"], .job-item');

    // Look for mock toggle using different selectors
    const mockToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.toLowerCase().includes('mock'));
    });

    console.log(`🔍 Search input found: ${!!searchInput}`);
    console.log(`📊 Job cards found: ${jobCards.length}`);
    console.log(`🔄 Mock toggle found: ${!!mockToggle}`);

    console.log('✅ Test 1 completed');

    // Test 2: Search functionality
    console.log('🔍 Test 2: Test search functionality with "solidity"');
    if (searchInput) {
      await takeScreenshot(page, 'before-search');
      await searchInput.type('solidity');
      await delay(1000);
      await searchInput.press('Enter');
      await delay(2000);
      await takeScreenshot(page, 'after-search-solidity');

      const jobCardsAfterSearch = await page.$$('.job-card, [data-testid="job-card"], .job-item');
      console.log(`📊 Job cards after search: ${jobCardsAfterSearch.length}`);
    }
    console.log('✅ Test 2 completed');

    // Test 3: Filter functionality
    console.log('🔍 Test 3: Test filter functionality');
    await takeScreenshot(page, 'before-filters');

    // Look for remote/onsite toggles
    const remoteToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.toLowerCase().includes('remote'));
    });
    const onsiteToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.toLowerCase().includes('onsite'));
    });

    if (remoteToggle) {
      console.log('🔄 Testing remote filter');
      await page.evaluate((btn) => btn.click(), remoteToggle);
      await delay(1000);
      await takeScreenshot(page, 'remote-filter');
    }

    if (onsiteToggle) {
      console.log('🏢 Testing onsite filter');
      await page.evaluate((btn) => btn.click(), onsiteToggle);
      await delay(1000);
      await takeScreenshot(page, 'onsite-filter');
    }

    const tagFilters = await page.$$('.tag-filter, .filter-tag, [data-testid="tag-filter"]');
    if (tagFilters.length > 0) {
      console.log(`🏷️ Found ${tagFilters.length} tag filters`);
      await tagFilters[0].click();
      await delay(1000);
      await takeScreenshot(page, 'tag-filter');
    }
    console.log('✅ Test 3 completed');

    // Test 4: Mock mode toggle
    console.log('🔍 Test 4: Test mock mode toggle');
    await takeScreenshot(page, 'before-mock-toggle');

    if (mockToggle) {
      console.log('🔄 Toggling mock mode');
      const initialText = await page.evaluate(el => el.textContent, mockToggle);
      console.log(`📝 Initial toggle text: ${initialText}`);

      await page.evaluate((btn) => btn.click(), mockToggle);
      await delay(2000);
      await takeScreenshot(page, 'after-mock-toggle');

      const afterText = await page.evaluate(el => el.textContent, mockToggle);
      console.log(`📝 Toggle text after click: ${afterText}`);
    } else {
      console.log('⚠️ Mock toggle not found on page');
    }
    console.log('✅ Test 4 completed');

    // Test 5: Test page
    console.log('🔍 Test 5: Navigate to test page and test mock data display');
    await page.goto('http://localhost:3000/test', { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'test-page-full', true);
    await takeScreenshot(page, 'test-page-viewport');

    const mockDataElements = await page.$$('.mock-data, [data-testid="mock-data"], .test-data');
    const testPageJobCards = await page.$$('.job-card, [data-testid="job-card"], .job-item');

    console.log(`📊 Mock data elements found: ${mockDataElements.length}`);
    console.log(`📊 Job cards on test page: ${testPageJobCards.length}`);
    console.log('✅ Test 5 completed');

    // Test 6: Responsive design
    console.log('🔍 Test 6: Test responsive design');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Desktop view
    await page.setViewport({ width: 1920, height: 1080 });
    await takeScreenshot(page, 'responsive-desktop');

    // Tablet view
    await page.setViewport({ width: 768, height: 1024 });
    await delay(1000);
    await takeScreenshot(page, 'responsive-tablet');

    // Mobile view
    await page.setViewport({ width: 375, height: 667 });
    await delay(1000);
    await takeScreenshot(page, 'responsive-mobile');

    // Small mobile view
    await page.setViewport({ width: 320, height: 568 });
    await delay(1000);
    await takeScreenshot(page, 'responsive-mobile-small');

    const navMenu = await page.$('nav, .navbar, .navigation');
    const hamburgerMenu = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.toLowerCase().includes('menu'));
    });

    console.log(`🧭 Navigation menu visible: ${!!navMenu}`);
    console.log(`🍔 Hamburger menu visible: ${!!hamburgerMenu}`);
    console.log('✅ Test 6 completed');

    // Test 7: Job cards content
    console.log('🔍 Test 7: Test job cards content and structure');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const allJobCards = await page.$$('.job-card, [data-testid="job-card"], .job-item');
    console.log(`📊 Testing ${allJobCards.length} job cards`);

    if (allJobCards.length > 0) {
      const firstCard = allJobCards[0];

      // Check for common job card elements
      const title = await firstCard.$('.job-title, h3, h4, [data-testid="job-title"]');
      const company = await firstCard.$('.company, .company-name, [data-testid="company"]');
      const salary = await firstCard.$('.salary, .compensation, [data-testid="salary"]');
      const tags = await firstCard.$$('.tag, .tags, [data-testid="tags"]');
      const description = await firstCard.$('.description, .job-description, [data-testid="description"]');

      console.log(`📝 Job title visible: ${!!title}`);
      console.log(`🏢 Company visible: ${!!company}`);
      console.log(`💰 Salary visible: ${!!salary}`);
      console.log(`🏷️ Tags visible: ${tags.length > 0}`);
      console.log(`📄 Description visible: ${!!description}`);

      if (title) {
        const titleText = await page.evaluate(el => el.textContent, title);
        console.log(`📝 First job title: ${titleText}`);
      }

      if (company) {
        const companyText = await page.evaluate(el => el.textContent, company);
        console.log(`🏢 First company: ${companyText}`);
      }

      await takeScreenshot(page, 'job-cards-detail');

      // Test hover effect
      await firstCard.hover();
      await delay(500);
      await takeScreenshot(page, 'job-card-hover');
    }
    console.log('✅ Test 7 completed');

    // Test 8: Navigation
    console.log('🔍 Test 8: Test navigation and links');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const navLinks = await page.$$('nav a, .navbar a, .navigation a');
    console.log(`🔗 Found ${navLinks.length} navigation links`);

    // Test first few navigation links
    for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
      const link = navLinks[i];
      const linkText = await page.evaluate(el => el.textContent, link);
      const href = await page.evaluate(el => el.href, link);

      console.log(`🔗 Testing link: ${linkText} -> ${href}`);

      if (href && !href.startsWith('http')) {
        try {
          await Promise.all([
            page.waitForNavigation({ timeout: 5000 }),
            link.click()
          ]);

          await delay(1000);
          await takeScreenshot(page, `navigation-${i}-${linkText?.replace(/[^a-z0-9]/gi, '-')}`);

          // Go back to main page
          await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        } catch (e) {
          console.log(`⚠️ Navigation failed for ${linkText}: ${e.message}`);
        }
      }
    }
    console.log('✅ Test 8 completed');

    console.log('🎉 All UI/UX tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    await takeScreenshot(page, 'error-screenshot', true);
  } finally {
    await browser.close();
  }
}

// Run the tests
testUI().catch(console.error);