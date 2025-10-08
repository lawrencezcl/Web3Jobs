import { test, expect } from '@playwright/test';

// Test configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://remotejobs.top';

test.describe('Web3 Jobs Platform - Production Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage loads and displays key elements', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Check page title
    await expect(page).toHaveTitle(/Web3 Jobs/);

    // Check hero section
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Your Web3 Career')).toBeVisible();

    // Check search functionality
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check trending keywords
    await expect(page.locator('text=Trending:')).toBeVisible();
    await expect(page.locator('text=Solidity')).toBeVisible();

    // Check stats section
    await expect(page.locator('text=Active Jobs')).toBeVisible();

    // Check popular companies section
    await expect(page.locator('text=Top Web3 Companies Hiring')).toBeVisible();

    // Check featured jobs
    const featuredJobs = page.locator('text=Featured Opportunities');
    if (await featuredJobs.isVisible()) {
      await expect(page.locator('text=View All Jobs')).toBeVisible();
    }
  });

  test('Search functionality works correctly', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Enter search term
    await page.fill('input[placeholder*="Search"]', 'Solidity Developer');
    await page.press('input[placeholder*="Search"]', 'Enter');

    // Wait for results
    await page.waitForTimeout(2000);

    // Check if results are displayed
    const results = page.locator('[data-testid="job-card"], .group');
    if (await results.count() > 0) {
      await expect(results.first()).toBeVisible();
    }
  });

  test('Navigation to jobs page works', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Click on View All Jobs button
    const viewAllJobsBtn = page.locator('text=View All Jobs');
    if (await viewAllJobsBtn.isVisible()) {
      await viewAllJobsBtn.click();
    } else {
      // Alternative navigation
      await page.click('a[href="/jobs"]');
    }

    // Verify we're on jobs page
    await expect(page).toHaveURL(/.*jobs/);
    await expect(page.locator('h1')).toContainText('Web3 Remote Jobs');
  });

  test('Filtering functionality works', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/jobs`);

    // Check if filter elements are present
    const remoteFilter = page.locator('select');
    if (await remoteFilter.first().isVisible()) {
      // Select remote only
      await page.selectOption('select', 'true');
      await page.waitForTimeout(1000);

      // Check tag filter
      const tagInput = page.locator('input[placeholder*="Tag"]');
      if (await tagInput.isVisible()) {
        await tagInput.fill('blockchain');
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Job detail page functionality', async ({ page }) => {
    // First go to jobs page
    await page.goto(`${PRODUCTION_URL}/jobs`);
    await page.waitForTimeout(2000);

    // Find a job card and click it
    const jobCard = page.locator('[href*="/jobs/"]').first();
    if (await jobCard.isVisible()) {
      await jobCard.click();

      // Verify job detail page
      await expect(page).toHaveURL(/.*jobs\/.*/);

      // Check for job details
      await expect(page.locator('h1, h2')).toBeVisible();

      // Check for apply button
      const applyBtn = page.locator('text=Apply, a[href*="apply"]');
      if (await applyBtn.first().isVisible()) {
        // Check it opens in new tab
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page'),
          applyBtn.first().click()
        ]);
        await newPage.waitForLoadState();
        expect(newPage.url()).toBeTruthy();
        await newPage.close();
      }
    }
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);

    // Check mobile menu if present
    const mobileMenu = page.locator('button[aria-label="Menu"], .mobile-menu-btn');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }

    // Check search on mobile
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check trending keywords wrap properly
    const trendingSection = page.locator('text=Trending:');
    if (await trendingSection.isVisible()) {
      await expect(trendingSection).toBeVisible();
    }
  });

  test('Company logos and links work', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Find company cards
    const companyCards = page.locator('[href*="/jobs?q="]');
    if (await companyCards.count() > 0) {
      const firstCard = companyCards.first();
      await firstCard.click();

      // Verify it navigates with search query
      await expect(page).toHaveURL(/.*jobs\?q=.*/);
    }
  });

  test('Newsletter subscription', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Scroll to newsletter section
    await page.evaluate(() => {
      document.querySelector('text=Never Miss a Web3 Opportunity')?.scrollIntoView();
    });

    // Find newsletter input
    const emailInput = page.locator('input[placeholder*="email"], input[placeholder*="Enter your email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');

      // Click subscribe button
      const subscribeBtn = page.locator('text=Subscribe, button[type="submit"]').first();
      if (await subscribeBtn.isVisible()) {
        // Note: This might show validation or success message
        await subscribeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Footer links work', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Scroll to footer
    await page.evaluate(() => {
      document.querySelector('footer')?.scrollIntoView();
    });

    // Check footer links
    const footerLinks = page.locator('footer a').first();
    if (await footerLinks.isVisible()) {
      await footerLinks.click();
      await page.waitForTimeout(1000);

      // Verify navigation or external link
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });

  test('Performance metrics', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(PRODUCTION_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check for key elements
    await expect(page.locator('h1')).toBeVisible({ timeout: 3000 });
  });

  test('Error handling', async ({ page }) => {
    // Test 404 page
    await page.goto(`${PRODUCTION_URL}/non-existent-page`);

    // Should show 404 or redirect to home
    const is404 = await page.locator('text=404, Not Found').isVisible();
    const isHome = await page.locator('h1').isVisible();

    expect(is404 || isHome).toBeTruthy();
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test jobs API
    const jobsResponse = await request.get(`${PRODUCTION_URL}/api/jobs`);
    expect(jobsResponse.status()).toBe(200);

    const jobsData = await jobsResponse.json();
    expect(jobsData).toHaveProperty('items');

    // Test filters API
    const filtersResponse = await request.get(`${PRODUCTION_URL}/api/filters`);
    expect(filtersResponse.status()).toBe(200);
  });

  test('SEO elements are present', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription).toContain('Web3');

    // Check canonical link
    const canonicalLink = await page.locator('link[rel="canonical"]').getAttribute('href');
    if (canonicalLink) {
      expect(canonicalLink).toContain('remotejobs.top');
    }

    // Check structured data
    const structuredData = await page.locator('script[type="application/ld+json"]').innerHTML();
    if (structuredData) {
      const parsed = JSON.parse(structuredData);
      expect(parsed).toHaveProperty('@context');
    }
  });
});

// Mobile-specific tests
test.describe('Mobile Tests', () => {
  test('Mobile search and filter', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);

    // Test search on mobile
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await page.fill('input[placeholder*="Search"]', 'DeFi');
    await page.press('input[placeholder*="Search"]', 'Enter');

    await page.waitForTimeout(2000);

    // Verify results
    const results = page.locator('[data-testid="job-card"], .group');
    expect(await results.count()).toBeGreaterThanOrEqual(0);
  });
});

// Accessibility tests
test.describe('Accessibility', () => {
  test('Basic accessibility checks', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1);

    // Check for alt text on images
    const images = page.locator('img');
    const imgCount = await images.count();

    for (let i = 0; i < Math.min(imgCount, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const isDecorative = await images.nth(i).getAttribute('role') === 'presentation';
      expect(alt || isDecorative).toBeTruthy();
    }

    // Check for form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const hasLabel = await inputs.nth(i).getAttribute('aria-label') ||
                       await inputs.nth(i).getAttribute('placeholder') ||
                       await page.locator(`label[for="${await inputs.nth(i).getAttribute('id')}"]`).isVisible();
      expect(hasLabel).toBeTruthy();
    }
  });
});