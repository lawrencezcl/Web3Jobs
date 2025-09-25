import { test, expect } from '@playwright/test';

test.describe('Web3 Jobs Application UI/UX Testing', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Set default timeout for all operations
    page.setDefaultTimeout(10000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('1. Navigate to main interface and take screenshots', async () => {
    console.log('🔍 Testing: Navigate to main interface and take screenshots');

    // Navigate to the main page
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of full page
    await page.screenshot({ path: 'screenshots/main-page-full.png', fullPage: true });

    // Take screenshot of viewport
    await page.screenshot({ path: 'screenshots/main-page-viewport.png' });

    // Verify page title
    await expect(page).toHaveTitle(/Web3|Jobs/i);

    // Check for key UI elements
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], .search-input');
    const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
    const mockToggle = page.locator('button:has-text("Mock"), .mock-toggle, [data-testid="mock-toggle"]');

    console.log('✅ Main page loaded successfully');
    console.log(`📊 Found ${await jobCards.count()} job cards`);
    console.log(`🔍 Search input visible: ${await searchInput.isVisible()}`);
    console.log(`🔄 Mock toggle visible: ${await mockToggle.isVisible()}`);
  });

  test('2. Test search functionality with "solidity"', async () => {
    console.log('🔍 Testing: Search functionality with "solidity"');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], .search-input');

    // Wait for search input to be visible
    await searchInput.waitFor({ state: 'visible' });

    // Take screenshot before search
    await page.screenshot({ path: 'screenshots/before-search.png' });

    // Type "solidity" in search input
    await searchInput.fill('solidity');

    // Wait a bit for potential auto-search or press Enter
    await page.waitForTimeout(1000);

    // Press Enter to trigger search
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(2000);

    // Take screenshot after search
    await page.screenshot({ path: 'screenshots/after-search-solidity.png' });

    // Check if search results are filtered
    const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
    const jobCount = await jobCards.count();

    console.log(`🔍 Search for "solidity" completed`);
    console.log(`📊 Found ${jobCount} job cards after search`);

    // Check if any job cards contain "solidity" in their text
    if (jobCount > 0) {
      const firstJobText = await jobCards.first().textContent();
      console.log(`📝 First job card text: ${firstJobText?.substring(0, 100)}...`);
    }
  });

  test('3. Test filter functionality (remote/onsite, tags)', async () => {
    console.log('🔍 Testing: Filter functionality');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Look for remote/onsite toggle
    const remoteToggle = page.locator('button:has-text("Remote"), .remote-toggle, [data-testid="remote-toggle"]');
    const onsiteToggle = page.locator('button:has-text("Onsite"), .onsite-toggle, [data-testid="onsite-toggle"]');

    // Take screenshot before filtering
    await page.screenshot({ path: 'screenshots/before-filters.png' });

    // Test remote filter if available
    if (await remoteToggle.isVisible()) {
      console.log('🔄 Testing remote filter');
      await remoteToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/remote-filter.png' });

      // Check job count after remote filter
      const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
      console.log(`📊 Found ${await jobCards.count()} remote jobs`);
    }

    // Test onsite filter if available
    if (await onsiteToggle.isVisible()) {
      console.log('🏢 Testing onsite filter');
      await onsiteToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/onsite-filter.png' });

      // Check job count after onsite filter
      const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
      console.log(`📊 Found ${await jobCards.count()} onsite jobs`);
    }

    // Look for tag filters
    const tagFilters = page.locator('.tag-filter, .filter-tag, [data-testid="tag-filter"]');
    const tagCount = await tagFilters.count();

    if (tagCount > 0) {
      console.log(`🏷️ Found ${tagCount} tag filters`);

      // Click first tag filter
      await tagFilters.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/tag-filter.png' });

      console.log('✅ Tag filter test completed');
    }
  });

  test('4. Test mock mode toggle button', async () => {
    console.log('🔍 Testing: Mock mode toggle');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Look for mock mode toggle
    const mockToggle = page.locator('button:has-text("Mock"), .mock-toggle, [data-testid="mock-toggle"]');

    // Take screenshot before toggling mock mode
    await page.screenshot({ path: 'screenshots/before-mock-toggle.png' });

    if (await mockToggle.isVisible()) {
      console.log('🔄 Toggling mock mode');

      // Get initial state
      const initialText = await mockToggle.textContent();
      console.log(`📝 Initial toggle text: ${initialText}`);

      // Click toggle
      await mockToggle.click();
      await page.waitForTimeout(2000);

      // Take screenshot after toggling mock mode
      await page.screenshot({ path: 'screenshots/after-mock-toggle.png' });

      // Check if toggle state changed
      const afterText = await mockToggle.textContent();
      console.log(`📝 Toggle text after click: ${afterText}`);

      // Check if job cards updated
      const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
      console.log(`📊 Found ${await jobCards.count()} job cards after mock toggle`);

      console.log('✅ Mock mode toggle test completed');
    } else {
      console.log('⚠️ Mock toggle not found on page');
    }
  });

  test('5. Navigate to test page and test mock data display', async () => {
    console.log('🔍 Testing: Mock data display on test page');

    // Navigate to test page
    await page.goto('http://localhost:3000/test');
    await page.waitForLoadState('networkidle');

    // Take screenshot of test page
    await page.screenshot({ path: 'screenshots/test-page-full.png', fullPage: true });
    await page.screenshot({ path: 'screenshots/test-page-viewport.png' });

    // Look for mock data elements
    const mockDataElements = page.locator('.mock-data, [data-testid="mock-data"], .test-data');
    const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');

    console.log(`📊 Found ${await mockDataElements.count()} mock data elements`);
    console.log(`📊 Found ${await jobCards.count()} job cards on test page`);

    // Check for test-specific elements
    const testHeading = page.locator('h1:has-text("Test"), h2:has-text("Test"), .test-heading');
    if (await testHeading.isVisible()) {
      console.log('📝 Test page heading found');
    }

    // Look for any debug information or mock data display
    const debugInfo = page.locator('.debug, .mock-info, [data-testid="debug-info"]');
    if (await debugInfo.isVisible()) {
      const debugText = await debugInfo.textContent();
      console.log(`🐛 Debug info: ${debugText}`);
    }

    console.log('✅ Test page mock data display test completed');
  });

  test('6. Test responsive design by resizing viewport', async () => {
    console.log('🔍 Testing: Responsive design');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Test desktop view (default)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/responsive-desktop.png' });
    console.log('🖥️ Desktop view screenshot taken');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/responsive-tablet.png' });
    console.log('📱 Tablet view screenshot taken');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/responsive-mobile.png' });
    console.log('📱 Mobile view screenshot taken');

    // Test small mobile view
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/responsive-mobile-small.png' });
    console.log('📱 Small mobile view screenshot taken');

    // Check if navigation menu is responsive
    const navMenu = page.locator('nav, .navbar, .navigation');
    const hamburgerMenu = page.locator('button:has-text("Menu"), .hamburger, .mobile-menu-toggle');

    console.log(`🧭 Navigation menu visible: ${await navMenu.isVisible()}`);
    console.log(`🍔 Hamburger menu visible: ${await hamburgerMenu.isVisible()}`);

    console.log('✅ Responsive design test completed');
  });

  test('7. Test job cards content and structure', async () => {
    console.log('🔍 Testing: Job cards content and structure');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const jobCards = page.locator('.job-card, [data-testid="job-card"], .job-item');
    const cardCount = await jobCards.count();

    console.log(`📊 Testing ${cardCount} job cards`);

    if (cardCount > 0) {
      // Test first job card structure
      const firstCard = jobCards.first();

      // Check for common job card elements
      const title = firstCard.locator('.job-title, h3, h4, [data-testid="job-title"]');
      const company = firstCard.locator('.company, .company-name, [data-testid="company"]');
      const salary = firstCard.locator('.salary, .compensation, [data-testid="salary"]');
      const tags = firstCard.locator('.tag, .tags, [data-testid="tags"]');
      const description = firstCard.locator('.description, .job-description, [data-testid="description"]');

      console.log(`📝 Job title visible: ${await title.isVisible()}`);
      console.log(`🏢 Company visible: ${await company.isVisible()}`);
      console.log(`💰 Salary visible: ${await salary.isVisible()}`);
      console.log(`🏷️ Tags visible: ${await tags.isVisible()}`);
      console.log(`📄 Description visible: ${await description.isVisible()}`);

      // Get text content for analysis
      if (await title.isVisible()) {
        const titleText = await title.textContent();
        console.log(`📝 First job title: ${titleText}`);
      }

      if (await company.isVisible()) {
        const companyText = await company.textContent();
        console.log(`🏢 First company: ${companyText}`);
      }

      // Take screenshot of job cards
      await page.screenshot({ path: 'screenshots/job-cards-detail.png' });

      // Test hover effects if possible
      await firstCard.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/job-card-hover.png' });
    }

    console.log('✅ Job cards content and structure test completed');
  });

  test('8. Test navigation and links', async () => {
    console.log('🔍 Testing: Navigation and links');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Find all navigation links
    const navLinks = page.locator('nav a, .navbar a, .navigation a');
    const linkCount = await navLinks.count();

    console.log(`🔗 Found ${linkCount} navigation links`);

    // Test first few navigation links
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = navLinks.nth(i);
      const linkText = await link.textContent();
      const href = await link.getAttribute('href');

      console.log(`🔗 Testing link: ${linkText} -> ${href}`);

      if (href && !href.startsWith('http')) {
        // Test internal navigation
        try {
          await Promise.all([
            page.waitForNavigation({ timeout: 5000 }),
            link.click()
          ]);

          await page.waitForTimeout(1000);
          await page.screenshot({ path: `screenshots/navigation-${i}-${linkText?.replace(/[^a-z0-9]/gi, '-')}.png` });

          // Go back to main page
          await page.goto('http://localhost:3000');
          await page.waitForLoadState('networkidle');
        } catch (e) {
          console.log(`⚠️ Navigation failed for ${linkText}: ${e.message}`);
        }
      }
    }

    console.log('✅ Navigation and links test completed');
  });
});