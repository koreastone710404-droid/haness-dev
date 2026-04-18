import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: [
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--ignore-gpu-blocklist',
    '--enable-gpu',
    '--enable-gpu-rasterization',
    '--enable-webgl',
    '--enable-accelerated-2d-canvas',
    '--use-gl=angle',
    '--use-angle=d3d11',
    '--enable-features=Vulkan',
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 6000));

  const full = path.join(__dirname, 'final-full.png');
  await page.screenshot({ path: full, fullPage: false });
  console.log('saved', full);

  // 3D 씬만 크롭해서 디테일 확인용 별도 저장
  const canvasBox = await page.evaluate(() => {
    const el = document.querySelector('.panel-scene');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (canvasBox) {
    const detail = path.join(__dirname, 'final-detail.png');
    await page.screenshot({ path: detail, clip: canvasBox });
    console.log('saved', detail);
  }
} finally {
  await browser.close();
}
