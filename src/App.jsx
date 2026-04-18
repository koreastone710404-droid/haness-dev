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
  const envelope = useMemo(() => calculateEnvelope(values), [values]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Haness · 건축 가능 영역 (Building Envelope) 시각화</h1>
        <p className="subtitle">
          토지 정보와 규제 값을 입력하면 신축 가능한 최대 건물 부피를 3D로 즉시 확인할 수 있습니다.
        </p>
      </header>

      <main className="app-main">
        <section className="panel panel-left">
          <InputForm values={values} onChange={setValues} />
        </section>
        <section className="panel panel-scene">
          <Scene3D envelope={envelope} />
        </section>
      </main>
    </div>
  );
}
