const fs = require('fs');
const { chromium } = require('playwright-core');
const CANDIDATES = [
  `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux/chrome`,
];
(async () => {
  const executablePath = CANDIDATES.find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, executablePath });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/mobile-top.png' });
  // bottom of page (tab bar + footer)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/mobile-bottom.png' });
  // menu open
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.click('.pub-nav-toggle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/mobile-menu.png' });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
