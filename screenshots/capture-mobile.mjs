import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle'],
});

try {
  const page = await browser.newPage();
  // iPhone 12 Pro 크기
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  );
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 3500));

  // 1) 드로어 닫힌 상태 (기본)
  const closedPath = path.join(__dirname, 'mobile-closed.png');
  await page.screenshot({ path: closedPath });
  console.log('saved', closedPath);

  // 2) 드로어 열린 상태 (햄버거 클릭 후)
  await page.click('.drawer-toggle');
  await new Promise((r) => setTimeout(r, 500));
  const openPath = path.join(__dirname, 'mobile-drawer-open.png');
  await page.screenshot({ path: openPath });
  console.log('saved', openPath);
} finally {
  await browser.close();
}
