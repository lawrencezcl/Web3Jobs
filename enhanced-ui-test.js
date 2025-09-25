import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'enhanced-screenshots');
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

async function enhancedUITest() {
  console.log('🚀 Starting Enhanced Web3 Jobs UI/UX Testing');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  try {
    // Test 1: Main Interface Analysis
    console.log('🔍 Test 1: Main Interface Analysis');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '01-main-interface-full', true);
    await takeScreenshot(page, '01-main-interface-viewport');

    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);

    // Analyze the main UI elements we found in the HTML
    const mainAnalysis = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const subtitle = document.querySelector('p.text-slate-400');
      const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
      const liveModeBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Live Mode')
      );
      const mockModeBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Mock Mode') || btn.textContent.includes('Try Mock Mode')
      );
      const searchBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Search')
      );
      const remoteSelect = document.querySelector('select');
      const jobGrid = document.querySelector('.grid');
      const noJobsMessage = document.querySelector('.text-center.py-12');

      return {
        heading: heading ? heading.textContent : null,
        subtitle: subtitle ? subtitle.textContent : null,
        searchInputsCount: searchInputs.length,
        liveModeFound: !!liveModeBtn,
        liveModeText: liveModeBtn ? liveModeBtn.textContent : null,
        mockModeFound: !!mockModeBtn,
        mockModeText: mockModeBtn ? mockModeBtn.textContent : null,
        searchBtnFound: !!searchBtn,
        searchBtnText: searchBtn ? searchBtn.textContent : null,
        remoteSelectFound: !!remoteSelect,
        jobGridFound: !!jobGrid,
        noJobsMessageFound: !!noJobsMessage,
        noJobsMessageText: noJobsMessage ? noJobsMessage.textContent : null
      };
    });

    console.log('📊 Main Interface Analysis:');
    console.log(`  📝 Heading: ${mainAnalysis.heading}`);
    console.log(`  📝 Subtitle: ${mainAnalysis.subtitle}`);
    console.log(`  🔍 Search Inputs: ${mainAnalysis.searchInputsCount}`);
    console.log(`  📡 Live Mode Button: ${mainAnalysis.liveModeFound} (${mainAnalysis.liveModeText})`);
    console.log(`  🧪 Mock Mode Button: ${mainAnalysis.mockModeFound} (${mainAnalysis.mockModeText})`);
    console.log(`  🔍 Search Button: ${mainAnalysis.searchBtnFound} (${mainAnalysis.searchBtnText})`);
    console.log(`  📍 Remote Select: ${mainAnalysis.remoteSelectFound}`);
    console.log(`  📋 Job Grid: ${mainAnalysis.jobGridFound}`);
    console.log(`  ❌ No Jobs Message: ${mainAnalysis.noJobsMessageFound}`);
    console.log(`  💬 No Jobs Text: ${mainAnalysis.noJobsMessageText}`);

    // Test 2: Search Functionality
    console.log('🔍 Test 2: Search Functionality');
    await takeScreenshot(page, '02-before-search');

    // Find search inputs and type "solidity"
    const searchInputs = await page.$$('input[placeholder*="Search"]');
    if (searchInputs.length > 0) {
      const firstSearchInput = searchInputs[0];
      await firstSearchInput.type('solidity');
      await delay(1000);
      await takeScreenshot(page, '02-search-solidity-typed');

      // Click search button
      const searchBtn = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Search'))
      );

      if (searchBtn) {
        await searchBtn.click();
        await delay(2000);
        await takeScreenshot(page, '02-after-search-solidity');
      }
    }

    // Test 3: Mock Mode Testing
    console.log('🔍 Test 3: Mock Mode Testing');
    await takeScreenshot(page, '03-before-mock-mode');

    const mockModeBtn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Mock Mode') || btn.textContent.includes('Try Mock Mode')
      )
    );

    if (mockModeBtn) {
      const buttonText = await page.evaluate(el => el.textContent, mockModeBtn);
      console.log(`🔄 Clicking mock mode button: ${buttonText}`);

      await mockModeBtn.click();
      await delay(3000); // Wait for mock data to load
      await takeScreenshot(page, '03-after-mock-mode');

      // Check if job cards appeared
      const jobCards = await page.$$('.grid > div');
      console.log(`📊 Job cards after mock mode: ${jobCards.length}`);

      // Take detailed screenshot of job cards if any exist
      if (jobCards.length > 0) {
        await takeScreenshot(page, '03-job-cards-detail');

        // Analyze job card content
        const jobCardAnalysis = await page.evaluate(() => {
          const firstCard = document.querySelector('.grid > div');
          if (!firstCard) return null;

          const title = firstCard.querySelector('h3, h4, .font-semibold');
          const company = firstCard.querySelector('.text-slate-400, .company');
          const salary = firstCard.querySelector('.text-green-400, .salary');
          const tags = firstCard.querySelectorAll('.tag, .badge, span');

          return {
            title: title ? title.textContent : null,
            company: company ? company.textContent : null,
            salary: salary ? salary.textContent : null,
            tagsCount: tags.length,
            tagTexts: Array.from(tags).slice(0, 3).map(tag => tag.textContent.trim())
          };
        });

        console.log('📝 First Job Card Analysis:');
        console.log(`  📝 Title: ${jobCardAnalysis?.title || 'Not found'}`);
        console.log(`  🏢 Company: ${jobCardAnalysis?.company || 'Not found'}`);
        console.log(`  💰 Salary: ${jobCardAnalysis?.salary || 'Not found'}`);
        console.log(`  🏷️ Tags: ${jobCardAnalysis?.tagsCount || 0} (${jobCardAnalysis?.tagTexts.join(', ') || 'none'})`);
      }
    }

    // Test 4: Filter Functionality
    console.log('🔍 Test 4: Filter Functionality');
    await takeScreenshot(page, '04-before-filters');

    // Test remote/onsite filter
    const remoteSelect = await page.$('select');
    if (remoteSelect) {
      console.log('📍 Testing remote/onsite filter');

      // Check current value
      const currentValue = await page.evaluate(el => el.value, remoteSelect);
      console.log(`  📍 Current value: ${currentValue}`);

      // Change to onsite
      await page.select('select', 'false');
      await delay(1000);
      await takeScreenshot(page, '04-onsite-filter');

      // Change back to remote
      await page.select('select', 'true');
      await delay(1000);
      await takeScreenshot(page, '04-remote-filter');
    }

    // Test 5: Test Page Navigation
    console.log('🔍 Test 5: Test Page Navigation');
    await page.goto('http://localhost:3000/test', { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '05-test-page-full', true);
    await takeScreenshot(page, '05-test-page-viewport');

    const testPageAnalysis = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const content = document.body.innerText.substring(0, 200);
      const jobCards = document.querySelectorAll('.job-card, .grid > div');

      return {
        heading: heading ? heading.textContent : null,
        contentPreview: content,
        jobCardsCount: jobCards.length
      };
    });

    console.log('📋 Test Page Analysis:');
    console.log(`  📝 Heading: ${testPageAnalysis.heading || 'No heading found'}`);
    console.log(`  📄 Content Preview: ${testPageAnalysis.contentPreview}...`);
    console.log(`  📊 Job Cards: ${testPageAnalysis.jobCardsCount}`);

    // Test 6: Responsive Design
    console.log('🔍 Test 6: Responsive Design');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-small', width: 320, height: 568 }
    ];

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await delay(1000);
      await takeScreenshot(page, `06-responsive-${viewport.name}`);
      console.log(`📱 ${viewport.name} view (${viewport.width}x${viewport.height})`);
    }

    // Test 7: Interactive Elements
    console.log('🔍 Test 7: Interactive Elements Testing');

    // Test all buttons
    const buttons = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      }));
    });

    const buttonsData = await buttons.jsonValue();
    console.log(`🔘 Found ${buttonsData.length} buttons:`);
    buttonsData.forEach((btn, index) => {
      console.log(`  ${index + 1}. "${btn.text}" (visible: ${btn.visible}, disabled: ${btn.disabled})`);
    });

    // Test all inputs
    const inputs = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('input, select')).map(input => ({
        type: input.type || input.tagName.toLowerCase(),
        placeholder: input.placeholder || '',
        value: input.value,
        visible: input.offsetParent !== null
      }));
    });

    const inputsData = await inputs.jsonValue();
    console.log(`📝 Found ${inputsData.length} inputs:`);
    inputsData.forEach((input, index) => {
      console.log(`  ${index + 1}. ${input.type} "${input.placeholder}" (value: "${input.value}", visible: ${input.visible})`);
    });

    console.log('🎉 Enhanced UI/UX Testing completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    await takeScreenshot(page, 'error-screenshot', true);
  } finally {
    await browser.close();
  }
}

// Run the enhanced tests
enhancedUITest().catch(console.error);