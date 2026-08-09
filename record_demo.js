import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function record() {
  const targetDir = 'E:\\Desktop\\ERPWEB';
  const videoTempDir = path.join(targetDir, 'temp_video');

  if (!fs.existsSync(videoTempDir)) {
    fs.mkdirSync(videoTempDir, { recursive: true });
  }

  console.log('Launching browser with video recording...');
  const browser = await chromium.launch({
    headless: false, // run visible headful so animations render smoothly
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoTempDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  const slowClick = async (selector, delay = 800) => {
    await page.waitForTimeout(delay);
    const el = page.locator(selector).first();
    if (await el.isVisible()) {
      await el.click();
    }
  };

  try {
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(1000);

    console.log('2. Filling credentials...');
    await page.fill('input[type="email"]', 'ghbzcc@gmail.com');
    await page.waitForTimeout(500);
    await page.fill('input[type="password"]', '01101631393.Mahmoud');
    await page.waitForTimeout(800);

    console.log('3. Submitting login form...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    console.log('4. Exploring Dashboard...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(2000);

    // Toggle theme to show Dark <-> Light mode in video
    console.log('5. Toggling Theme to Light Mode...');
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(2000);

    console.log('6. Toggling Language to English...');
    await page.click('.lang-btn:has-text("EN")');
    await page.waitForTimeout(2000);

    console.log('7. Toggling Language back to Arabic (Egyptian)...');
    await page.click('.lang-btn:has-text("ع")');
    await page.waitForTimeout(2000);

    console.log('8. Navigating to Customers...');
    await page.goto('http://localhost:5173/customers');
    await page.waitForTimeout(2000);

    console.log('9. Navigating to Sales Orders...');
    await page.goto('http://localhost:5173/sales-orders');
    await page.waitForTimeout(2000);

    console.log('10. Navigating to Suppliers...');
    await page.goto('http://localhost:5173/suppliers');
    await page.waitForTimeout(2000);

    console.log('11. Navigating to Purchase Orders...');
    await page.goto('http://localhost:5173/purchase-orders');
    await page.waitForTimeout(2000);

    console.log('12. Navigating to Products...');
    await page.goto('http://localhost:5173/products');
    await page.waitForTimeout(2000);

    console.log('13. Navigating to Categories...');
    await page.goto('http://localhost:5173/categories');
    await page.waitForTimeout(2000);

    console.log('14. Navigating to Warehouses...');
    await page.goto('http://localhost:5173/warehouses');
    await page.waitForTimeout(2000);

    console.log('15. Navigating to Stock Levels...');
    await page.goto('http://localhost:5173/stock');
    await page.waitForTimeout(2000);

    console.log('16. Navigating to Employees...');
    await page.goto('http://localhost:5173/employees');
    await page.waitForTimeout(2000);

    console.log('17. Navigating to Departments...');
    await page.goto('http://localhost:5173/departments');
    await page.waitForTimeout(2000);

    console.log('18. Navigating to Branches...');
    await page.goto('http://localhost:5173/branches');
    await page.waitForTimeout(2000);

    console.log('19. Navigating to Attendance...');
    await page.goto('http://localhost:5173/attendance');
    await page.waitForTimeout(2000);

    console.log('20. Navigating to Leave Requests...');
    await page.goto('http://localhost:5173/leave-requests');
    await page.waitForTimeout(2000);

    console.log('21. Navigating to Chart of Accounts (المحاسبة)...');
    await page.goto('http://localhost:5173/accounts');
    await page.waitForTimeout(2000);

    console.log('22. Navigating to Journal Entries...');
    await page.goto('http://localhost:5173/journal-entries');
    await page.waitForTimeout(2000);

    console.log('23. Navigating to Users...');
    await page.goto('http://localhost:5173/users');
    await page.waitForTimeout(2000);

    console.log('24. Navigating to Roles & Permissions...');
    await page.goto('http://localhost:5173/roles');
    await page.waitForTimeout(2000);

    console.log('25. Navigating to Company Profile...');
    await page.goto('http://localhost:5173/company');
    await page.waitForTimeout(2000);

    console.log('26. Switch back to Dark Mode...');
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(1500);

    console.log('27. Back to Dashboard...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(2000);

    console.log('Closing page & context to flush video file...');
    await page.close();
    await context.close();
    await browser.close();

    // Find recorded video in temp directory and move it to target location
    const files = fs.readdirSync(videoTempDir);
    const videoFile = files.find(f => f.endsWith('.webm'));

    if (videoFile) {
      const srcPath = path.join(videoTempDir, videoFile);
      const destPath = path.join(targetDir, 'ERP_System_Walkthrough.webm');
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ VIDEO SUCCESSFULLY SAVED TO: ${destPath}`);
      fs.rmSync(videoTempDir, { recursive: true, force: true });
    } else {
      console.error('No video file found in temp dir.');
    }
  } catch (err) {
    console.error('Recording error:', err);
    await browser.close();
  }
}

record();
