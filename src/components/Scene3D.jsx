import { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ZONE_LABEL } from '../data/zoning-defaults.js';

// ─────────────────────────────────────────────────────────────
// 건축 애니메이션 파라미터 (층별 순차 상승)
// ─────────────────────────────────────────────────────────────
const FLOOR_STAGGER = 0.12; // 층당 시작 딜레이 (초)
const FLOOR_DURATION = 0.5; // 한 층이 다 자라는 시간 (초)

// easeOutBack: 생동감 있는 살짝 오버슈트 이징
function easeOutBack(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// 좌표 규약: +X = 북(N), -X = 남(S), +Z = 동(E), -Z = 서(W), +Y = 위(Up)

// ─────────────────────────────────────────────────────────────
// 공용 유틸: 캔버스 기반 텍스처 라벨
// ─────────────────────────────────────────────────────────────
function makeLabelTexture(text, options = {}) {
  const {
    bg = 'rgba(255,255,255,0.9)',
    fg = '#111',
    font = 'bold 40px sans-serif',
    w = 256,
    h = 64,
  } = options;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ─────────────────────────────────────────────────────────────
// 한 개 층 — 아래부터 솟아오르는 애니메이션
// - group을 yBottom에 두고 scale.y 0→1로 그룹 자체를 세로로 늘림
// - opacity 0→0.45 로 페이드인 (생동감)
// - resetKey 변경 시 startTime 초기화 → 재생
// ─────────────────────────────────────────────────────────────
function AnimatedFloor({ box, floorIndex, showEdges, resetKey }) {
  const groupRef = useRef();
  const matRef = useRef();
  const edgeMatRef = useRef();
  const startRef = useRef(null);

  const geom = useMemo(
    () => new THREE.BoxGeometry(box.boxD, box.boxH, box.boxW),
    [box.boxD, box.boxH, box.boxW]
  );

  // resetKey 바뀌면 애니메이션 재시작
  useEffect(() => {
    startRef.current = null;
    if (groupRef.current) groupRef.current.scale.y = 0.0001;
    if (matRef.current) matRef.current.opacity = 0;
    if (edgeMatRef.current) edgeMatRef.current.opacity = 0;
  }, [resetKey]);

  useFrame(({ clock }) => {
    const now = clock.getElapsedTime();
    if (startRef.current === null) startRef.current = now;
    const elapsed = now - startRef.current - floorIndex * FLOOR_STAGGER;
    const tRaw = Math.max(0, Math.min(1, elapsed / FLOOR_DURATION));
    const eased = easeOutBack(tRaw);
    if (groupRef.current) groupRef.current.scale.y = Math.max(0.0001, eased);
    if (matRef.current) matRef.current.opacity = 0.45 * Math.min(1, tRaw * 1.8);
    if (edgeMatRef.current) edgeMatRef.current.opacity = 0.85 * Math.min(1, tRaw * 1.8);
  });

  const yBottom = box.centerY - box.boxH / 2;

  return (
    <group ref={groupRef} position={[box.centerX, yBottom, 0]} scale={[1, 0.0001, 1]}>
      <mesh position={[0, box.boxH / 2, 0]} geometry={geom}>
        <meshLambertMaterial ref={matRef} color="#4a90e2" transparent opacity={0} />
      </mesh>
      {showEdges && (
        <lineSegments position={[0, box.boxH / 2, 0]}>
          <edgesGeometry args={[geom]} />
          <lineBasicMaterial ref={edgeMatRef} color="#1a3a6c" transparent opacity={0} />
        </lineSegments>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 건축 매스: 층별 stepback 박스 스택 + 순차 상승 애니메이션
// ─────────────────────────────────────────────────────────────
function BuildingMass({ envelope, showEdges }) {
  const {
    footprintWidth: W,
    footprintDepth: D,
    floors,
    floorHeight,
    sunlight,
  } = envelope;

  const floorBoxes = useMemo(() => {
    const list = [];
    const setbackAtTop = (yTop) => {
      if (!sunlight.applied || yTop <= sunlight.threshold) return 0;
      return (yTop - sunlight.threshold) * sunlight.slope;
    };
    for (let n = 1; n <= floors; n++) {
      const yBottom = (n - 1) * floorHeight;
      const yTop = n * floorHeight;
      const setback = setbackAtTop(yTop);
      const boxD = Math.max(0.2, D - setback); // 남북(X) 길이
      const centerX = -setback / 2; // 남쪽 면 고정 + 북쪽만 후퇴
      const centerY = (yBottom + yTop) / 2;
      list.push({ boxD, boxW: W, boxH: floorHeight, centerX, centerY });
    }
    return list;
  }, [W, D, floors, floorHeight, sunlight.applied, sunlight.threshold, sunlight.slope]);

  // 입력값이 매스 형태를 바꾸면 resetKey 가 변해 애니메이션이 재시작
  // (showEdges 같은 단순 표시 토글은 포함하지 않음 — 재시작 불필요)
  const resetKey = useMemo(
    () =>
      `${floors}|${floorHeight}|${W.toFixed(2)}|${D.toFixed(2)}|${sunlight.applied}|${sunlight.threshold}|${sunlight.slope}`,
    [floors, floorHeight, W, D, sunlight.applied, sunlight.threshold, sunlight.slope]
  );

  return (
    <group>
      {floorBoxes.map((f, i) => (
        <AnimatedFloor
          key={i}
          box={f}
          floorIndex={i}
          showEdges={showEdges}
          resetKey={resetKey}
        />
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 대지면 + 경계선
// ─────────────────────────────────────────────────────────────
function LotPlane({ siteWidth, siteDepth }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[siteDepth, siteWidth]} />
        <meshLambertMaterial color="#e8e6df" side={THREE.DoubleSide} />
      </mesh>
      <lineSegments position-y={0.01}>
        <edgesGeometry args={[new THREE.BoxGeometry(siteDepth, 0.02, siteWidth)]} />
        <lineBasicMaterial color="#333333" />
      </lineSegments>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 정북일조권 제한면 (북측 대지경계에서 1.5m 이격, 9m까지 수직 + 상부 1:2 사선)
// ─────────────────────────────────────────────────────────────
function SolarPlane({ envelope, siteWidth, siteDepth }) {
  const { sunlight, envelopeHeight } = envelope;

  const geometry = useMemo(() => {
    if (!sunlight.applied) return null;
    const threshold = sunlight.threshold;
    const slope = sunlight.slope;
    const topH = Math.max(envelopeHeight + 2, threshold + 3);
    const BASE_OFFSET = 1.5;
    const northX = siteDepth / 2 - BASE_OFFSET; // 수직 구간 X
    const topX = northX - (topH - threshold) * slope; // 상부 사선 끝 X
    const zW = -siteWidth / 2 - 1;
    const zE = siteWidth / 2 + 1;

    // 수직 구간(사각형) + 사선 구간(사각형) = 4 삼각형 = 12 버텍스
    const v = [
      // 수직 구간
      [northX, 0, zW], [northX, 0, zE], [northX, threshold, zE],
      [northX, 0, zW], [northX, threshold, zE], [northX, threshold, zW],
      // 사선 구간
      [northX, threshold, zW], [northX, threshold, zE], [topX, topH, zE],
      [northX, threshold, zW], [topX, topH, zE], [topX, topH, zW],
    ];
    const positions = new Float32Array(v.flat());
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }, [sunlight.applied, sunlight.threshold, sunlight.slope, envelopeHeight, siteWidth, siteDepth]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#ff9933"
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// N 방향 화살표 + N 스프라이트 라벨
// ─────────────────────────────────────────────────────────────
function NorthArrow({ siteWidth, siteDepth }) {
  const start = useMemo(
    () => new THREE.Vector3(-siteDepth / 2 - 2, 0.05, -siteWidth / 2 - 2),
    [siteWidth, siteDepth]
  );
  const arrowObj = useMemo(() => {
    return new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), // +X = 북
      start,
      3,
      0xd9534f,
      0.9,
      0.6
    );
  }, [start]);

  const labelTex = useMemo(
    () =>
      makeLabelTexture('N', {
        bg: 'rgba(255,255,255,0)',
        fg: '#d9534f',
        font: 'bold 48px sans-serif',
        w: 64,
        h: 64,
      }),
    []
  );

  return (
    <group>
      <primitive object={arrowObj} />
      <sprite
        position={[-siteDepth / 2 + 2, 0.8, -siteWidth / 2 - 2]}
        scale={[1.8, 1.8, 1]}
      >
        <spriteMaterial map={labelTex} transparent depthTest={false} />
      </sprite>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 치수 라인 + 라벨 (대지 폭 / 깊이 / 건물 높이)
// ─────────────────────────────────────────────────────────────
function DimensionLine({ a, b, label, yOffset = 0.4 }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints([a, b]);
    }
  }, [a, b]);

  const tex = useMemo(() => makeLabelTexture(label), [label]);
  const mid = useMemo(() => {
    const m = a.clone().add(b).multiplyScalar(0.5);
    m.y += yOffset;
    return m;
  }, [a, b, yOffset]);

  return (
    <group>
      <line ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color="#222222" />
      </line>
      <sprite position={[mid.x, mid.y, mid.z]} scale={[3, 0.75, 1]}>
        <spriteMaterial map={tex} transparent depthTest={false} />
      </sprite>
    </group>
  );
}

function Dimensions({ siteWidth, siteDepth, buildingHeight }) {
  const SW = siteWidth;
  const SD = siteDepth;
  const H = buildingHeight;

  return (
    <group>
      {/* 대지 깊이(남북, X축) : 남쪽 가장자리 바깥(Z=-SW/2-1.2)에 표시 */}
      <DimensionLine
        a={new THREE.Vector3(-SD / 2, 0, -SW / 2 - 1.2)}
        b={new THREE.Vector3(SD / 2, 0, -SW / 2 - 1.2)}
        label={`${SD.toFixed(1)} m`}
      />
      {/* 대지 폭(동서, Z축) : 북동 가장자리 바깥(X=SD/2+1.2)에 표시 */}
      <DimensionLine
        a={new THREE.Vector3(SD / 2 + 1.2, 0, -SW / 2)}
        b={new THREE.Vector3(SD / 2 + 1.2, 0, SW / 2)}
        label={`${SW.toFixed(1)} m`}
      />
      {/* 건물 높이 : 북동 코너에서 수직 표시 */}
      <DimensionLine
        a={new THREE.Vector3(SD / 2 + 0.3, 0, SW / 2 + 0.3)}
        b={new THREE.Vector3(SD / 2 + 0.3, H, SW / 2 + 0.3)}
        label={`H ${H.toFixed(1)} m`}
        yOffset={0.2}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 격자 (간단한 GridHelper)
// ─────────────────────────────────────────────────────────────
function FloorGrid({ span }) {
  const grid = useMemo(() => {
    const size = Math.ceil(span * 1.5);
    return new THREE.GridHelper(size, size, 0xcccccc, 0xeeeeee);
  }, [span]);
  grid.position.y = 0.005;
  return <primitive object={grid} />;
}

// ─────────────────────────────────────────────────────────────
// 카메라 초기 포지셔닝
// ─────────────────────────────────────────────────────────────
function CameraRig({ siteWidth, siteDepth, buildingHeight }) {
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const span = Math.max(siteWidth, siteDepth, buildingHeight || 10);
    const d = span * 2.2;
    camera.position.set(d, d * 0.9, d);
    camera.lookAt(0, buildingHeight / 2, 0);
    camera.updateProjectionMatrix();
    initialized.current = true;
  }, [camera, siteWidth, siteDepth, buildingHeight]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// 플로팅 오버레이: 요약 / 컨트롤 / 면책
// ─────────────────────────────────────────────────────────────
function fmt(n, digits = 1) {
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function SummaryOverlay({ envelope }) {
  const zoneLabel = envelope.input.zone
    ? ZONE_LABEL[envelope.input.zone] || '직접 입력'
    : '직접 입력';

  return (
    <div className="overlay overlay-summary">
      <h3>건축가능영역 (개략)</h3>
      <div className="row"><span>대지면적</span><span>{fmt(envelope.siteArea)} ㎡</span></div>
      <div className="row"><span>용도지역</span><span>{zoneLabel}</span></div>
      <div className="row"><span>건폐율</span><span>{fmt(envelope.actualBcr)} %</span></div>
      <div className="row"><span>용적률</span><span>{fmt(envelope.actualFar)} %</span></div>
      <div className="row"><span>건축면적</span><span>{fmt(envelope.footprintArea)} ㎡</span></div>
      <div className="row"><span>연면적</span><span>{fmt(envelope.achievableFloorArea)} ㎡</span></div>
      <div className="row"><span>최고 층수</span><span>{envelope.floors} 층</span></div>
      <div className="row"><span>최고 높이</span><span>{fmt(envelope.envelopeHeight)} m</span></div>
    </div>
  );
}

function ControlsOverlay({ toggles, onToggle }) {
  const items = [
    { key: 'solar', label: '일조권 사면' },
    { key: 'grid', label: '격자 (1m)' },
    { key: 'dim', label: '치수 표시' },
    { key: 'edge', label: '외곽선' },
  ];
  return (
    <div className="overlay overlay-controls">
      {items.map((it) => (
        <label key={it.key}>
          <input
            type="checkbox"
            checked={toggles[it.key]}
            onChange={(e) => onToggle(it.key, e.target.checked)}
          />
          {it.label}
        </label>
      ))}
    </div>
  );
}

function DisclaimerOverlay() {
  return (
    <div className="overlay overlay-disclaimer">
      ※ 법정 최대치를 적용한 <b>개략 스터디</b>입니다. 실제 인가 가능 규모는 지자체
      조례·지구단위계획·도로/주차/이격 등에 따라 달라집니다.
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 Scene3D
// ─────────────────────────────────────────────────────────────
export default function Scene3D({ envelope }) {
  const [toggles, setToggles] = useState({
    solar: true,
    grid: true,
    dim: true,
    edge: true,
  });

  const onToggle = (key, value) => setToggles((prev) => ({ ...prev, [key]: value }));

  if (!envelope || !envelope.ok) {
    return (
      <div className="scene-placeholder">
        <p>{envelope?.errors?.[0] || '입력값을 확인하세요.'}</p>
      </div>
    );
  }

  const { input, envelopeHeight } = envelope;
  const span = Math.max(input.siteWidth, input.siteDepth, envelopeHeight || 10);

  return (
    <div className="scene-container">
      <Canvas camera={{ fov: 45, near: 0.1, far: 2000 }} gl={{ antialias: true }}>
        <CameraRig
          siteWidth={input.siteWidth}
          siteDepth={input.siteDepth}
          buildingHeight={envelopeHeight}
        />
        <color attach="background" args={['#fafafa']} />

        <ambientLight intensity={0.55} />
        <directionalLight position={[40, 80, 30]} intensity={0.9} />

        <LotPlane siteWidth={input.siteWidth} siteDepth={input.siteDepth} />
        {toggles.grid && <FloorGrid span={span} />}
        <BuildingMass envelope={envelope} showEdges={toggles.edge} />
        {toggles.solar && (
          <SolarPlane
            envelope={envelope}
            siteWidth={input.siteWidth}
            siteDepth={input.siteDepth}
          />
        )}
        <NorthArrow siteWidth={input.siteWidth} siteDepth={input.siteDepth} />
        {toggles.dim && (
          <Dimensions
            siteWidth={input.siteWidth}
            siteDepth={input.siteDepth}
            buildingHeight={envelopeHeight}
          />
        )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          target={[0, envelopeHeight / 2, 0]}
        />
      </Canvas>

      <SummaryOverlay envelope={envelope} />
      <ControlsOverlay toggles={toggles} onToggle={onToggle} />
      <DisclaimerOverlay />
    </div>
  );
}
