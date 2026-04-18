// 건축 가능 영역(Building Envelope) 계산 로직
// 전제(MVP):
// - 대지는 직사각형 (폭: 동서, 깊이: 남북)
// - 건물 Footprint는 대지와 동일한 종횡비, 대지 중앙에 배치
// - 정북일조권: 기준 높이(법정 10m / 서울 9m) 초과 부분에서 북측으로부터
//              (높이 - 기준) × 1/2 만큼 이격 (건축법 §61, 시행령 §86)
// - 가로구역별 최고높이: 입력 시 그 값으로 상한 제한
// - 대지 안의 공지(도로 이격): 단순히 시각화용 주변 여백으로 표시

export const FLOOR_HEIGHT = 3; // m (1개층 평균 층고)
export const SUNLIGHT_THRESHOLD_DEFAULT = 10; // m (법정 기본: 건축법 시행령 §86)
export const SUNLIGHT_THRESHOLD_SEOUL = 9; // m (서울시 건축조례 강화 기준)
export const SUNLIGHT_SLOPE = 0.5; // 기준 높이 초과분의 1/2 이격

export function calculateEnvelope(input) {
  const {
    siteWidth,
    siteDepth,
    bcr,
    far,
    maxHeightLimit = 0,
    roadSetback = 0,
    applySunlight = true,
    sunlightThreshold = SUNLIGHT_THRESHOLD_DEFAULT,
    floorHeight = FLOOR_HEIGHT,
  } = input;

  const errors = validateInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const siteArea = siteWidth * siteDepth;
  const maxFootprintArea = siteArea * (bcr / 100);
  const maxFloorArea = siteArea * (far / 100);

  // Footprint: 대지와 동일한 종횡비 유지
  const aspect = siteWidth / siteDepth;
  let footprintDepth = Math.sqrt(maxFootprintArea / aspect);
  let footprintWidth = maxFootprintArea / footprintDepth;

  // 도로 이격(대지 안의 공지) 적용 - 단순히 각 변에서 축소
  const usableWidth = Math.max(siteWidth - roadSetback * 2, 1);
  const usableDepth = Math.max(siteDepth - roadSetback * 2, 1);
  if (footprintWidth > usableWidth) {
    footprintWidth = usableWidth;
    footprintDepth = maxFootprintArea / footprintWidth;
  }
  if (footprintDepth > usableDepth) {
    footprintDepth = usableDepth;
    footprintWidth = maxFootprintArea / footprintDepth;
  }

  const footprintArea = footprintWidth * footprintDepth;

  // 이론적 최대 높이 (용적률만으로 산출)
  const floorsByFar = maxFloorArea / footprintArea;
  const theoreticalHeight = floorsByFar * floorHeight;

  // 최고높이 제한 반영
  let envelopeHeight =
    maxHeightLimit > 0 ? Math.min(theoreticalHeight, maxHeightLimit) : theoreticalHeight;

  // 정북일조권 반영 후 실제 확보 가능 연면적 계산
  const { achievableFloorArea, actualFloors, actualHeight } = simulateFloors({
    footprintWidth,
    footprintDepth,
    envelopeHeight,
    maxFloorArea,
    applySunlight,
    sunlightThreshold,
    floorHeight,
  });

  const actualBcr = (footprintArea / siteArea) * 100;
  const actualFar = (achievableFloorArea / siteArea) * 100;

  return {
    ok: true,
    errors: [],
    input,
    siteArea,
    maxFootprintArea,
    maxFloorArea,
    footprintWidth,
    footprintDepth,
    footprintArea,
    theoreticalHeight,
    envelopeHeight: actualHeight,
    achievableFloorArea,
    floors: actualFloors,
    floorHeight,
    actualBcr,
    actualFar,
    sunlight: {
      applied: applySunlight,
      threshold: sunlightThreshold,
      slope: SUNLIGHT_SLOPE,
      topSetback: applySunlight
        ? Math.max(0, (actualHeight - sunlightThreshold) * SUNLIGHT_SLOPE)
        : 0,
    },
  };
}

// 층별 누적 연면적을 계산하여 실제 달성 가능한 층수/높이/연면적 산출
// 정북일조권으로 상층부가 좁아지면 층당 면적이 줄어듦
function simulateFloors({
  footprintWidth,
  footprintDepth,
  envelopeHeight,
  maxFloorArea,
  applySunlight,
  sunlightThreshold,
  floorHeight,
}) {
  const maxFloors = Math.floor(envelopeHeight / floorHeight);
  let achievableFloorArea = 0;
  let actualFloors = 0;

  for (let n = 1; n <= maxFloors; n++) {
    const floorTop = n * floorHeight;
    const depthAtThisFloor = floorDepthAt(floorTop, footprintDepth, applySunlight, sunlightThreshold);
    const areaThisFloor = footprintWidth * depthAtThisFloor;

    if (achievableFloorArea + areaThisFloor > maxFloorArea + 0.01) {
      // 용적률 상한 도달 - 마지막 층은 부분 면적만 사용
      const remaining = maxFloorArea - achievableFloorArea;
      if (remaining > 1) {
        achievableFloorArea += remaining;
        actualFloors = n; // 부분층도 1개 층으로 카운트
      }
      break;
    }

    achievableFloorArea += areaThisFloor;
    actualFloors = n;
  }

  const actualHeight = actualFloors * floorHeight;
  return { achievableFloorArea, actualFloors, actualHeight };
}

// 층 상단 높이에서 남북 방향 건물 깊이
// 정북일조권: (높이 - 기준) × 1/2 만큼 북측에서 후퇴
function floorDepthAt(heightTop, baseDepth, applySunlight, threshold) {
  if (!applySunlight || heightTop <= threshold) {
    return baseDepth;
  }
  const setback = (heightTop - threshold) * SUNLIGHT_SLOPE;
  return Math.max(baseDepth - setback, 0);
}

function validateInput(input) {
  const errors = [];
  if (!(input.siteWidth > 0)) errors.push('대지 폭(동서)은 0보다 커야 합니다.');
  if (!(input.siteDepth > 0)) errors.push('대지 깊이(남북)는 0보다 커야 합니다.');
  if (!(input.bcr > 0 && input.bcr <= 100)) errors.push('건폐율은 0 초과 100 이하여야 합니다.');
  if (!(input.far > 0 && input.far <= 2000)) errors.push('용적률은 0 초과 2000 이하여야 합니다.');
  if (input.roadSetback < 0) errors.push('도로 이격 거리는 0 이상이어야 합니다.');
  if (input.maxHeightLimit < 0) errors.push('최고높이 제한은 0 이상이어야 합니다.');
  return errors;
}
