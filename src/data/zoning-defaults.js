// 용도지역별 건폐율·용적률 법정 최대한도 (기계 판독 가능 형식)
//
// ⚠ SINGLE SOURCE OF TRUTH: docs/references/korean-zoning-defaults.md
//   이 파일은 위 md 참고표의 기계 판독 전용 사본입니다.
//   법령 개정 시 반드시 두 파일을 **함께** 갱신해야 합니다. (AGENTS.md 불변식 I5)
//
// 법적 근거:
//   - 「국토의 계획 및 이용에 관한 법률」 시행령 §84·§85 (건폐율·용적률)
//   - 「건축법」 §61, 시행령 §86 (정북일조권)
// 기준 시점: 2024-07-30 개정 반영

// 정북일조권: applySunlight = 전용주거 + 일반주거만 true, 그 외는 false
// 기준 높이: 법정 10m / 서울 조례 강화 9m
export const SUNLIGHT_RULES = {
  thresholdLegal: 10, // 건축법 시행령 §86 법정 기본
  thresholdSeoul: 9, // 서울시 건축조례 강화
  slope: 0.5, // 초과분 × 1/2 이격
  baseOffset: 1.5, // 0~10m 구간 최소 이격 (m)
  // 적용 대상 용도지역 카테고리 키
  appliesTo: ['전용주거', '일반주거'],
};

// 용도지역 카테고리 (InputForm optgroup 순서 = 이 배열 순서)
export const ZONE_CATEGORIES = [
  {
    label: '도시 - 주거지역',
    zones: [
      { key: '제1종전용주거', label: '제1종 전용주거지역', bcr: 50, far: 100, applySunlight: true },
      { key: '제2종전용주거', label: '제2종 전용주거지역', bcr: 50, far: 150, applySunlight: true },
      { key: '제1종일반주거', label: '제1종 일반주거지역', bcr: 60, far: 200, applySunlight: true },
      { key: '제2종일반주거', label: '제2종 일반주거지역', bcr: 60, far: 250, applySunlight: true },
      { key: '제3종일반주거', label: '제3종 일반주거지역', bcr: 50, far: 300, applySunlight: true },
      { key: '준주거', label: '준주거지역', bcr: 70, far: 500, applySunlight: false },
    ],
  },
  {
    label: '도시 - 상업지역',
    zones: [
      { key: '중심상업', label: '중심상업지역', bcr: 90, far: 1500, applySunlight: false },
      { key: '일반상업', label: '일반상업지역', bcr: 80, far: 1300, applySunlight: false },
      { key: '근린상업', label: '근린상업지역', bcr: 70, far: 900, applySunlight: false },
      { key: '유통상업', label: '유통상업지역', bcr: 80, far: 1100, applySunlight: false },
    ],
  },
  {
    label: '도시 - 공업지역',
    zones: [
      { key: '전용공업', label: '전용공업지역', bcr: 70, far: 300, applySunlight: false },
      { key: '일반공업', label: '일반공업지역', bcr: 70, far: 350, applySunlight: false },
      { key: '준공업', label: '준공업지역', bcr: 70, far: 400, applySunlight: false },
    ],
  },
  {
    label: '도시 - 녹지지역',
    zones: [
      { key: '보전녹지', label: '보전녹지지역', bcr: 20, far: 80, applySunlight: false },
      { key: '생산녹지', label: '생산녹지지역', bcr: 20, far: 100, applySunlight: false },
      { key: '자연녹지', label: '자연녹지지역', bcr: 20, far: 100, applySunlight: false },
    ],
  },
  {
    label: '관리 · 농림 · 자연환경',
    zones: [
      { key: '보전관리', label: '보전관리지역', bcr: 20, far: 80, applySunlight: false },
      { key: '생산관리', label: '생산관리지역', bcr: 20, far: 80, applySunlight: false },
      { key: '계획관리', label: '계획관리지역', bcr: 40, far: 100, applySunlight: false },
      { key: '농림', label: '농림지역', bcr: 20, far: 80, applySunlight: false },
      { key: '자연환경보전', label: '자연환경보전지역', bcr: 20, far: 80, applySunlight: false },
    ],
  },
];

// 키 → 프리셋 빠른 조회
export const ZONE_INDEX = Object.fromEntries(
  ZONE_CATEGORIES.flatMap((cat) => cat.zones.map((z) => [z.key, z]))
);

// 라벨만 추출 (Summary 오버레이용)
export const ZONE_LABEL = Object.fromEntries(
  ZONE_CATEGORIES.flatMap((cat) => cat.zones.map((z) => [z.key, z.label]))
);
