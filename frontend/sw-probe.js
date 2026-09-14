const fs = require('fs');
const { chromium } = require('playwright-core');
const EXE = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXE });
  const ctx = await browser.newContext({ viewport: { width: 1869, height: 1007 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 300)));
  // load once to let RegisterSW install the service worker
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? `registered, active=${!!reg.active}, scope=${reg.scope}` : 'none';
  });
  console.log('SW:', swState);
  // navigate around like a user, then reload
  for (const r of ['/', '/news', '/', '/download', '/']) {
    await page.goto(`http://localhost:3000${r}`, { waitUntil: 'networkidle', timeout: 20000 }).catch((e) => errors.push('[goto] ' + e.message.slice(0, 200)));
    await page.waitForTimeout(800);
  }
  await page.reload({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1500);
  const overlay = await page.evaluate(() => {
    let out = '';
    document.querySelectorAll('nextjs-portal').forEach((d) => {
      if (!d.shadowRoot) return;
      const t = d.shadowRoot.querySelector('[data-nextjs-dialog]')?.innerText || '';
      if (t.trim()) out += t.slice(0, 1500);
    });
    return out;
  });
  await page.screenshot({ path: '/tmp/sw-final.png' });
  console.log('errors:', errors.length ? '\n' + errors.join('\n') : 'none');
  console.log('overlay:', overlay || 'none');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
