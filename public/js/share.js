/* 책임감 장치 공용: 캘린더(.ics) 생성, 파일 내려받기, 공유/복사 */
(function (root) {
  const escapeICS = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');
  const pad = n => String(n).padStart(2, '0');
  /* 시간대 없는 로컬 시각(floating): 사용자 기기의 현지 시간으로 해석됨 */
  const fmtLocal = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const fmtUTC = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  /* RFC 5545: 한 줄 75 octet 이하, 이어지는 줄은 공백으로 시작. 문자 중간에서 자르지 않음 */
  function foldLine(line) {
    const enc = s => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(s).length : Buffer.byteLength(s, 'utf8'));
    const out = [];
    let cur = '', limit = 75;
    for (const ch of line) {
      if (enc(cur + ch) > limit) { out.push(cur); cur = ' ' + ch; limit = 75; }
      else cur += ch;
    }
    out.push(cur);
    return out.join('\r\n');
  }

  function buildICS(events) {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//social-anxiety-workbook//KO', 'CALSCALE:GREGORIAN'];
    const stamp = fmtUTC(new Date());
    for (const e of events) {
      const end = new Date(e.start.getTime() + (e.durationMin || 30) * 60000);
      L.push('BEGIN:VEVENT', `UID:${e.uid}@social-anxiety-workbook`, `DTSTAMP:${stamp}`,
        `DTSTART:${fmtLocal(e.start)}`, `DTEND:${fmtLocal(end)}`,
        `SUMMARY:${escapeICS(e.title)}`);
      if (e.desc) L.push(`DESCRIPTION:${escapeICS(e.desc)}`);
      if (e.rrule) L.push(`RRULE:${e.rrule}`);
      if (e.alarmMin != null) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeICS(e.title)}`, `TRIGGER:-PT${e.alarmMin}M`, 'END:VALARM');
      L.push('END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return L.map(foldLine).join('\r\n') + '\r\n';
  }

  /* 브라우저 전용 */
  function download(filename, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  /* 휴대폰 공유 시트가 있으면 사용, 없으면 클립보드 복사. 결과 문구를 돌려준다 */
  async function shareOrCopy(text, title) {
    if (navigator.share) {
      try { await navigator.share({ title, text }); return '공유 창을 열었어요'; }
      catch (e) { if (e && e.name === 'AbortError') return '공유를 취소했어요'; }
    }
    try { await navigator.clipboard.writeText(text); return '복사했어요. 메신저에 붙여 넣으세요'; }
    catch (e) { return null; }
  }

  const api = { buildICS, escapeICS, foldLine, fmtLocal, download, shareOrCopy };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CWShare = api;
})(typeof window !== 'undefined' ? window : globalThis);
