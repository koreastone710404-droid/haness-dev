// 용도지역 프리셋 및 일조권 기준값은 별도 데이터 파일에서 import한다.
// - 사람 참고용: docs/references/korean-zoning-defaults.md
// - 기계 판독용: src/data/zoning-defaults.js
// 법령 개정 시 두 파일을 함께 수정 (AGENTS.md 불변식 I5).
import { ZONE_CATEGORIES, ZONE_INDEX, SUNLIGHT_RULES } from '../data/zoning-defaults.js';

export default function InputForm({ values, onChange }) {
  const update = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    onChange({ ...values, [key]: v });
  };

  const updateString = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  const applyPreset = (e) => {
    const key = e.target.value;
    if (!key) {
      onChange({ ...values, zone: '' });
      return;
    }
    const preset = ZONE_INDEX[key];
    if (!preset) return;
    onChange({
      ...values,
      zone: key,
      bcr: preset.bcr,
      far: preset.far,
      applySunlight: preset.applySunlight,
    });
  };

  return (
    <form className="input-form" onSubmit={(e) => e.preventDefault()}>
      <h2>입력</h2>

      <fieldset>
        <legend>용도지역 프리셋 (법정 최대치)</legend>
        <select value={values.zone || ''} onChange={applyPreset}>
          <option value="">직접 입력</option>
          {ZONE_CATEGORIES.map((cat) => (
            <optgroup key={cat.label} label={cat.label}>
              {cat.zones.map((z) => (
                <option key={z.key} value={z.key}>
                  {z.label} (건폐 {z.bcr}% / 용적 {z.far}%)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="hint">
          ※ 지자체 도시·군계획조례는 법정 최대치 이하 범위에서 별도로 정하므로 실제 적용값이 더 낮을 수 있습니다.
        </p>
      </fieldset>

      <fieldset>
        <legend>대지 정보</legend>
        <label>
          대지 폭 (동서, m)
          <input type="number" min="1" step="0.5" value={values.siteWidth} onChange={update('siteWidth')} />
        </label>
        <label>
          대지 깊이 (남북, m)
          <input type="number" min="1" step="0.5" value={values.siteDepth} onChange={update('siteDepth')} />
        </label>
        <p className="hint">현재 대지면적: {(values.siteWidth * values.siteDepth).toFixed(1)} m²</p>
      </fieldset>

      <fieldset>
        <legend>규제</legend>
        <label>
          건폐율 (%)
          <input type="number" min="1" max="100" step="1" value={values.bcr} onChange={update('bcr')} />
        </label>
        <label>
          용적률 (%)
          <input type="number" min="1" max="2000" step="10" value={values.far} onChange={update('far')} />
        </label>
        <label>
          최고높이 제한 (m, 0=없음)
          <input type="number" min="0" step="1" value={values.maxHeightLimit} onChange={update('maxHeightLimit')} />
        </label>
        <label>
          도로 이격 (대지 안의 공지, m)
          <input type="number" min="0" step="0.5" value={values.roadSetback} onChange={update('roadSetback')} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={values.applySunlight} onChange={update('applySunlight')} />
          정북일조권 적용 (전용·일반주거)
        </label>
        <label>
          일조권 기준 높이
          <select
            value={String(values.sunlightThreshold ?? SUNLIGHT_RULES.thresholdLegal)}
            onChange={updateString('sunlightThreshold')}
          >
            <option value={SUNLIGHT_RULES.thresholdLegal}>
              법정 기본 ({SUNLIGHT_RULES.thresholdLegal}m)
            </option>
            <option value={SUNLIGHT_RULES.thresholdSeoul}>
              서울시 조례 강화 ({SUNLIGHT_RULES.thresholdSeoul}m)
            </option>
          </select>
        </label>
      </fieldset>
    </form>
  );
}
