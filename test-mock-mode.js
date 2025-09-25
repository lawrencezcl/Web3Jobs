import puppeteer from 'puppeteer';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMockMode() {
  console.log('🧪 Testing Mock Mode Functionality');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Take screenshot before mock mode
    await page.screenshot({ path: 'mock-mode-before.png' });

    // Click the mock mode button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mockButton = buttons.find(btn => btn.textContent.includes('Try Mock Mode'));
      if (mockButton) {
        mockButton.click();
      }
    });

    // Wait for mock data to load
    await delay(3000);

    // Take screenshot after mock mode
    await page.screenshot({ path: 'mock-mode-after.png' });

    // Check if job cards appeared
    const jobCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('.grid > div');
      return cards.length;
    });

    console.log(`📊 Found ${jobCards} job cards after enabling mock mode`);

    if (jobCards > 0) {
      // Get details of first job card
      const firstJob = await page.evaluate(() => {
        const firstCard = document.querySelector('.grid > div');
        if (!firstCard) return null;

        const titleEl = firstCard.querySelector('h3, h4, .font-semibold');
        const companyEl = firstCard.querySelector('.text-slate-400, .company');
        const salaryEl = firstCard.querySelector('.text-green-400, .salary');
        const tags = firstCard.querySelectorAll('.tag, .badge, span');

        return {
          title: titleEl ? titleEl.textContent.trim() : 'No title found',
          company: companyEl ? companyEl.textContent.trim() : 'No company found',
          salary: salaryEl ? salaryEl.textContent.trim() : 'No salary found',
          tags: Array.from(tags).slice(0, 5).map(tag => tag.textContent.trim())
        };
      });

      console.log('📝 First job card details:');
      console.log(`  Title: ${firstJob.title}`);
      console.log(`  Company: ${firstJob.company}`);
      console.log(`  Salary: ${firstJob.salary}`);
      console.log(`  Tags: ${firstJob.tags.join(', ')}`);
    }

    console.log('✅ Mock mode test completed');

  } catch (error) {
    console.error('❌ Error testing mock mode:', error);
  } finally {
    await browser.close();
  }
}

testMockMode().catch(console.error);