import { useMemo, useState } from 'react';
import InputForm from './components/InputForm.jsx';
import Scene3D from './components/Scene3D.jsx';
import { calculateEnvelope } from './logic/envelope.js';

const DEFAULT_VALUES = {
  zone: '제2종일반주거',
  siteWidth: 18,
  siteDepth: 18,
  bcr: 60,
  far: 250,
  maxHeightLimit: 0,
  roadSetback: 1,
  applySunlight: true,
  sunlightThreshold: 10, // 건축법 시행령 §86 법정 기본 (서울시 조례 강화 시 9)
};

export default function App() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const envelope = useMemo(() => calculateEnvelope(values), [values]);

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="drawer-toggle"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="입력 패널 열기"
          aria-expanded={drawerOpen}
        >
          ☰
        </button>
        <div className="app-header-text">
          <h1>Haness · 건축 가능 영역 시각화</h1>
          <p className="subtitle">
            토지 정보와 규제 값을 입력하면 신축 가능한 최대 건물 부피를 3D로 즉시 확인할 수 있습니다.
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className={`panel panel-left ${drawerOpen ? 'drawer-open' : ''}`}>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="입력 패널 닫기"
          >
            ×
          </button>
          <InputForm values={values} onChange={setValues} />
        </section>
        {drawerOpen && (
          <div
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
        <section className="panel panel-scene">
          <Scene3D envelope={envelope} />
        </section>
      </main>
    </div>
  );
}
