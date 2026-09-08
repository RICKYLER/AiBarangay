/* Regenerates frontend/public/og.png (1200×630 @2x) from
   scripts/generate-og.html using the cached headless Chromium.
   Run from frontend/:  node scripts/og-shot.js
   (playwright-core is installed --no-save; browsers cached in
   ~/.cache/ms-playwright). */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const CANDIDATES = [
  `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux/chrome`,
];

(async () => {
  const executablePath = CANDIDATES.find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto('file://' + path.resolve(__dirname, 'generate-og.html'), {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const out = path.resolve(__dirname, '../public/og.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('wrote', out);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
