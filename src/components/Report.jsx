import React from 'react';

function fmt(n, digits = 1) {
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export default function Report({ envelope }) {
  if (!envelope) return null;

  if (!envelope.ok) {
    return (
      <aside className="report error">
        <h2>결과</h2>
        <ul>
          {envelope.errors.map((err, i) => (
            <li key={i}>⚠ {err}</li>
          ))}
        </ul>
      </aside>
    );
  }

  const rows = [
    { label: '대지면적', value: `${fmt(envelope.siteArea)} m²` },
    { label: '건축면적 (Footprint)', value: `${fmt(envelope.footprintArea)} m²` },
    { label: '연면적 (확보 가능)', value: `${fmt(envelope.achievableFloorArea)} m²` },
    { label: '최대 연면적 (용적률 상한)', value: `${fmt(envelope.maxFloorArea)} m²` },
    { label: '층수 (추정)', value: `${envelope.floors} 층` },
    { label: '건물 높이', value: `${fmt(envelope.envelopeHeight)} m` },
    { label: '실제 건폐율', value: `${fmt(envelope.actualBcr)} %` },
    { label: '실제 용적률', value: `${fmt(envelope.actualFar)} %` },
    {
      label: '정북일조권 후퇴 (최상부)',
      value: envelope.sunlight.applied ? `${fmt(envelope.sunlight.topSetback)} m` : '적용 안 함',
    },
  ];

  const hitFarCap = envelope.achievableFloorArea >= envelope.maxFloorArea - 1;
  const hitHeightCap =
    envelope.input.maxHeightLimit > 0 &&
    envelope.envelopeHeight >= envelope.input.maxHeightLimit - 0.1;

  return (
    <aside className="report">
      <h2>결과</h2>
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th>{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="notes">
        {hitFarCap && <p className="note">ℹ 용적률 상한에 도달했습니다.</p>}
        {hitHeightCap && <p className="note">ℹ 최고높이 제한에 도달했습니다.</p>}
        {envelope.sunlight.applied && envelope.envelopeHeight > envelope.sunlight.threshold && (
          <p className="note">
            ℹ 정북일조권에 의해 9m 초과 부분이 북측으로부터{' '}
            {fmt(envelope.sunlight.topSetback)} m 후퇴했습니다.
          </p>
        )}
      </div>

      <p className="disclaimer">
        ※ 본 도구는 개략 사업성 검토용입니다. 실제 건축허가에는 지자체 조례, 문화재/경관/건축
        한계선 등 추가 규제가 적용될 수 있습니다.
      </p>
    </aside>
  );
}
