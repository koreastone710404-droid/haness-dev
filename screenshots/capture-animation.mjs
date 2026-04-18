// 건물이 아래층부터 순차적으로 솟아오르는 애니메이션 중간 프레임 캡처
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
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 10000 });

  // 애니메이션 트리거: 건폐율 변경 (envelope 재계산 → resetKey 변경)
  await new Promise((r) => setTimeout(r, 2500)); // 초기 안정화

  // 건폐율 50 → 60 입력을 위해 input 변경 (이미 60이지만, 값 재세팅으로 트리거)
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('.input-form input[type="number"]');
    const bcrInput = inputs[2]; // [width, depth, bcr, far, ...]
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(bcrInput, '55');
    bcrInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // 각 프레임 캡처 (0ms, 200ms, 400ms, 700ms, 1100ms)
  const frames = [100, 350, 600, 900, 1400];
  for (let i = 0; i < frames.length; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? frames[0] : frames[i] - frames[i - 1]));
    const out = path.join(__dirname, `animation-frame-${i + 1}.png`);
    await page.screenshot({ path: out });
    console.log(`saved ${out} (~${frames[i]}ms)`);
  }
} finally {
  await browser.close();
}
