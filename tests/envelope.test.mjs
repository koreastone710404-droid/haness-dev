import { calculateEnvelope } from '../src/logic/envelope.js';
import assert from 'node:assert/strict';

let passed = 0;
let failed = 0;

function approx(label, actual, expected, tol = 0.5) {
  const ok = Math.abs(actual - expected) <= tol;
  if (ok) return true;
  throw new Error(`${label}: expected ≈ ${expected} (±${tol}), got ${actual}`);
}

function inRange(label, actual, lo, hi) {
  const ok = actual >= lo && actual <= hi;
  if (ok) return true;
  throw new Error(`${label}: expected in [${lo}, ${hi}], got ${actual}`);
}

function run(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

const BASE = {
  siteWidth: 18,
  siteDepth: 18,
  bcr: 60,
  far: 250,
  maxHeightLimit: 0,
  roadSetback: 1,
  applySunlight: true,
  sunlightThreshold: 10,
};

console.log('▶ envelope.js — 계산 로직 검증\n');

console.log('Group 1 · 기본 케이스 (제2종 일반주거, 법정 10m)');
run('siteArea = 324㎡', () => {
  const r = calculateEnvelope(BASE);
  assert.equal(r.ok, true);
  approx('siteArea', r.siteArea, 324, 0.1);
});
run('maxFootprintArea = 194.4㎡', () => {
  const r = calculateEnvelope(BASE);
  approx('maxFootprintArea', r.maxFootprintArea, 194.4, 0.1);
});
run('maxFloorArea = 810㎡', () => {
  const r = calculateEnvelope(BASE);
  approx('maxFloorArea', r.maxFloorArea, 810, 0.1);
});
run('floors = 4, height = 12m', () => {
  const r = calculateEnvelope(BASE);
  assert.equal(r.floors, 4);
  approx('envelopeHeight', r.envelopeHeight, 12, 0.01);
});
run('연면적 763~764㎡ (법정 10m 기준 단차 1m)', () => {
  const r = calculateEnvelope(BASE);
  inRange('achievableFloorArea', r.achievableFloorArea, 762, 765);
});

console.log('\nGroup 2 · 서울시 조례 강화 (9m 기준)');
run('동일 입력에 threshold=9만 바꾸면 연면적 감소', () => {
  const a = calculateEnvelope(BASE);
  const b = calculateEnvelope({ ...BASE, sunlightThreshold: 9 });
  assert.ok(
    b.achievableFloorArea < a.achievableFloorArea,
    `Seoul(9m) 연면적(${b.achievableFloorArea}) < 법정(10m) 연면적(${a.achievableFloorArea})`
  );
});
run('9m 기준 연면적 ≈ 756~757㎡', () => {
  const r = calculateEnvelope({ ...BASE, sunlightThreshold: 9 });
  inRange('achievableFloorArea@9m', r.achievableFloorArea, 755, 758);
});
run('topSetback = (H-9)×0.5 = 1.5m', () => {
  const r = calculateEnvelope({ ...BASE, sunlightThreshold: 9 });
  approx('topSetback', r.sunlight.topSetback, 1.5, 0.01);
});

console.log('\nGroup 3 · 일조권 미적용 (상업·공업 시나리오)');
run('applySunlight=false → 단차 없음, 연면적 동일 층수 × 바닥면적', () => {
  const r = calculateEnvelope({ ...BASE, applySunlight: false });
  approx('achievableFloorArea', r.achievableFloorArea, 4 * r.footprintArea, 0.1);
});
run('일조권 미적용 시 연면적이 적용 시보다 크다', () => {
  const withSun = calculateEnvelope(BASE);
  const noSun = calculateEnvelope({ ...BASE, applySunlight: false });
  assert.ok(
    noSun.achievableFloorArea > withSun.achievableFloorArea,
    `noSun(${noSun.achievableFloorArea}) > withSun(${withSun.achievableFloorArea})`
  );
});

console.log('\nGroup 4 · 프리셋 법정 최대치 검증 (첨부 문서 기준)');
run('중심상업 bcr=90%, far=1500%', () => {
  const r = calculateEnvelope({ ...BASE, bcr: 90, far: 1500, applySunlight: false });
  assert.equal(r.ok, true);
  assert.ok(r.achievableFloorArea > 3000, `연면적은 3000㎡ 이상 (got ${r.achievableFloorArea})`);
});
run('일반상업 far=1300% ⇒ 중심상업보다 연면적 작다', () => {
  const a = calculateEnvelope({ ...BASE, bcr: 80, far: 1300, applySunlight: false });
  const b = calculateEnvelope({ ...BASE, bcr: 90, far: 1500, applySunlight: false });
  assert.ok(a.achievableFloorArea < b.achievableFloorArea);
});
run('근린상업 far=900%', () => {
  const r = calculateEnvelope({ ...BASE, bcr: 70, far: 900, applySunlight: false });
  assert.equal(r.ok, true);
  approx('maxFloorArea', r.maxFloorArea, 324 * 9, 0.1);
});
run('제1종전용주거 far=100%', () => {
  const r = calculateEnvelope({ ...BASE, bcr: 50, far: 100 });
  approx('maxFloorArea', r.maxFloorArea, 324, 0.1);
});
run('보전녹지 far=80%', () => {
  const r = calculateEnvelope({ ...BASE, bcr: 20, far: 80 });
  approx('maxFloorArea', r.maxFloorArea, 324 * 0.8, 0.1);
});

console.log('\nGroup 5 · 최고높이 제한 및 입력 검증');
run('maxHeightLimit=6 ⇒ 2층으로 제한', () => {
  const r = calculateEnvelope({ ...BASE, maxHeightLimit: 6 });
  assert.equal(r.floors, 2);
  approx('envelopeHeight', r.envelopeHeight, 6, 0.01);
});
run('잘못된 입력(siteWidth=0) → ok=false', () => {
  const r = calculateEnvelope({ ...BASE, siteWidth: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.errors.length > 0);
});
run('잘못된 입력(bcr=150) → ok=false', () => {
  const r = calculateEnvelope({ ...BASE, bcr: 150 });
  assert.equal(r.ok, false);
});

console.log('\nGroup 6 · sunlight 메타 데이터 노출');
run('envelope.sunlight.threshold = 입력값 반영 (10)', () => {
  const r = calculateEnvelope(BASE);
  approx('sunlight.threshold', r.sunlight.threshold, 10, 0.01);
});
run('envelope.sunlight.threshold = 9', () => {
  const r = calculateEnvelope({ ...BASE, sunlightThreshold: 9 });
  approx('sunlight.threshold', r.sunlight.threshold, 9, 0.01);
});
run('envelope.sunlight.applied = false 반영', () => {
  const r = calculateEnvelope({ ...BASE, applySunlight: false });
  assert.equal(r.sunlight.applied, false);
  approx('topSetback', r.sunlight.topSetback, 0, 0.01);
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`결과: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
