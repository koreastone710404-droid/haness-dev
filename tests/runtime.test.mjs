// UI 런타임 스모크 + 상호작용 테스트
// Vite dev 서버(localhost:5173)가 실행 중이어야 함
import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'http://localhost:5173/';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

async function readSummary(page) {
  return await page.evaluate(() => {
    const rows = document.querySelectorAll('.overlay-summary .row');
    const obj = {};
    rows.forEach((r) => {
      const spans = r.querySelectorAll('span');
      if (spans.length >= 2) obj[spans[0].textContent.trim()] = spans[1].textContent.trim();
    });
    return obj;
  });
}

function parseNum(s) {
  if (!s) return NaN;
  return parseFloat(s.replace(/[^0-9.-]/g, ''));
}

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForSelector('.overlay-summary', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 2500));

  console.log('▶ UI 런타임 테스트\n');

  console.log('Group A · 초기 렌더링 및 오버레이 노출');

  await test('Canvas(3D) 요소 존재', async () => {
    const has = await page.$('canvas');
    if (!has) throw new Error('canvas not found');
  });

  await test('좌상단 Summary 오버레이 노출', async () => {
    const has = await page.$('.overlay-summary');
    if (!has) throw new Error('.overlay-summary not found');
  });

  await test('우상단 Controls 오버레이 + 체크박스 4종', async () => {
    const cnt = await page.$$eval('.overlay-controls input[type="checkbox"]', (els) => els.length);
    if (cnt !== 4) throw new Error(`expected 4 toggles, got ${cnt}`);
  });

  await test('하단 Disclaimer 배너 노출', async () => {
    const has = await page.$('.overlay-disclaimer');
    if (!has) throw new Error('.overlay-disclaimer not found');
  });

  await test('Summary: 기본 대지면적 = 324.0 ㎡', async () => {
    const s = await readSummary(page);
    if (!s['대지면적']) throw new Error('대지면적 row missing');
    const n = parseNum(s['대지면적']);
    if (Math.abs(n - 324) > 0.5) throw new Error(`expected 324, got ${n}`);
  });

  await test('Summary: 기본 층수 = 4층', async () => {
    const s = await readSummary(page);
    if (!/4/.test(s['최고 층수'])) throw new Error(`got '${s['최고 층수']}'`);
  });

  console.log('\nGroup B · 용도지역 프리셋 변경');

  await test('프리셋 dropdown 21종 옵션 노출 (optgroup 5개)', async () => {
    const info = await page.evaluate(() => {
      const sel = document.querySelector('.input-form fieldset select');
      return {
        options: sel ? sel.querySelectorAll('option').length : 0,
        optgroups: sel ? sel.querySelectorAll('optgroup').length : 0,
      };
    });
    if (info.options < 22) throw new Error(`options < 22 (got ${info.options})`); // 21 + "직접 입력"
    if (info.optgroups !== 5) throw new Error(`expected 5 optgroups, got ${info.optgroups}`);
  });

  await test('중심상업 프리셋 선택 → 연면적·용적률 크게 증가', async () => {
    const before = await readSummary(page);
    await page.select('.input-form fieldset select', '중심상업');
    await new Promise((r) => setTimeout(r, 500));
    const after = await readSummary(page);
    const beforeGfa = parseNum(before['연면적']);
    const afterGfa = parseNum(after['연면적']);
    if (!(afterGfa > beforeGfa * 3))
      throw new Error(`expected afterGfa > 3× beforeGfa, got ${beforeGfa} → ${afterGfa}`);
  });

  await test('중심상업 선택 시 용적률 레이블 = "중심상업지역"', async () => {
    const s = await readSummary(page);
    if (!/중심상업/.test(s['용도지역']))
      throw new Error(`got '${s['용도지역']}'`);
  });

  // 복원
  await page.select('.input-form fieldset select', '제2종일반주거');
  await new Promise((r) => setTimeout(r, 500));

  console.log('\nGroup C · 일조권 기준 높이 (법정 10m ↔ 서울 9m)');

  await test('기준 높이 10m → 9m 변경 시 연면적 감소', async () => {
    const sels = await page.$$eval('.input-form select', (els) =>
      els.map((e) => e.options[e.selectedIndex]?.value)
    );
    const thresholdSel = await page.evaluateHandle(() => {
      const fieldsets = document.querySelectorAll('.input-form fieldset');
      for (const fs of fieldsets) {
        const sel = fs.querySelector('select');
        if (sel && /10|9/.test(Array.from(sel.options).map((o) => o.value).join(','))) {
          return sel;
        }
      }
      return null;
    });

    const before = await readSummary(page);
    // 기준 높이 셀렉터(법정/서울)를 찾기 - 두번째 select
    const selectors = await page.$$('.input-form select');
    // 마지막이 일조권 기준
    await selectors[selectors.length - 1].evaluate((el) => {
      el.value = '9';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 500));
    const after = await readSummary(page);
    const beforeGfa = parseNum(before['연면적']);
    const afterGfa = parseNum(after['연면적']);
    if (!(afterGfa < beforeGfa))
      throw new Error(`expected afterGfa < beforeGfa (${afterGfa} < ${beforeGfa})`);
  });

  // 복원
  const lastSel = (await page.$$('.input-form select')).slice(-1)[0];
  await lastSel.evaluate((el) => {
    el.value = '10';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 300));

  console.log('\nGroup D · 레이어 토글');

  await test('일조권 사면 토글 해제 → 재적용', async () => {
    const [solar] = await page.$$('.overlay-controls input[type="checkbox"]');
    const before = await solar.evaluate((el) => el.checked);
    await solar.click();
    await new Promise((r) => setTimeout(r, 200));
    const after = await solar.evaluate((el) => el.checked);
    if (before === after) throw new Error('toggle did not change state');
    await solar.click();
    await new Promise((r) => setTimeout(r, 200));
  });

  await test('외곽선 토글 on/off 동작', async () => {
    const cbs = await page.$$('.overlay-controls input[type="checkbox"]');
    const edgeCb = cbs[cbs.length - 1]; // 외곽선이 마지막
    const before = await edgeCb.evaluate((el) => el.checked);
    await edgeCb.click();
    await new Promise((r) => setTimeout(r, 200));
    const after = await edgeCb.evaluate((el) => el.checked);
    if (before === after) throw new Error('toggle did not change state');
    await edgeCb.click();
    await new Promise((r) => setTimeout(r, 200));
  });

  console.log('\nGroup E · 입력 반응성');

  await test('대지 폭 변경 → 대지면적 즉시 업데이트', async () => {
    const inputs = await page.$$('.input-form input[type="number"]');
    const widthInput = inputs[0]; // 첫번째 = 대지 폭
    await widthInput.click({ clickCount: 3 });
    await widthInput.type('20');
    await new Promise((r) => setTimeout(r, 400));
    const s = await readSummary(page);
    const n = parseNum(s['대지면적']);
    if (Math.abs(n - 360) > 0.5) throw new Error(`expected 360, got ${n}`);
    // 복원
    await widthInput.click({ clickCount: 3 });
    await widthInput.type('18');
    await new Promise((r) => setTimeout(r, 300));
  });

  // 최종 상태 캡처
  const outPath = path.join(__dirname, '..', 'screenshots', 'runtime-final.png');
  await page.screenshot({ path: outPath });
  console.log(`\nsaved ${outPath}`);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`UI 테스트 결과: ${passed} passed, ${failed} failed`);
} finally {
  await browser.close();
}

process.exit(failed > 0 ? 1 : 0);
