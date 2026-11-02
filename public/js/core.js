/* 공용: 저장소, escape, 라우터, UI 조각, 차트 */
(function () {
  const KEY = 'cwsad.v1';
  const blank = () => ({
    version: 1,
    screens: [], profiles: [], formulations: [], weekly: [], program: null,
    exp: { e1: [], e2: [], e3: [], e4: [], e5: [], e6: [] },
  });

  function normalize(d) {
    const b = blank();
    if (!d || typeof d !== 'object') return b;
    for (const k of ['screens', 'profiles', 'formulations', 'weekly']) if (Array.isArray(d[k])) b[k] = d[k];
    if (d.program && typeof d.program === 'object') b.program = d.program;
    if (d.exp && typeof d.exp === 'object') for (const k of Object.keys(b.exp)) if (Array.isArray(d.exp[k])) b.exp[k] = d.exp[k];
    return b;
  }

  const Store = {
    get() {
      try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return blank(); }
    },
    save(mutator) {
      const d = Store.get();
      mutator(d);
      try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
    },
    exportText() { return JSON.stringify(Store.get(), null, 2); },
    importText(text) {
      let parsed;
      try { parsed = JSON.parse(text); } catch (e) { return '파일을 읽을 수 없어요. 이 워크북에서 내보낸 JSON 파일인지 확인해 주세요.'; }
      if (!parsed || parsed.version !== 1) return '이 워크북의 백업 파일 형식이 아니에요.';
      try { localStorage.setItem(KEY, JSON.stringify(normalize(parsed))); } catch (e) { return '브라우저 저장소를 사용할 수 없어요.'; }
      return null;
    },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
    available() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; } },
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => new Date().toISOString().slice(0, 10);
  const fmtDate = iso => { try { return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return iso; } };

  /* 라우터: #name/sub → Views[name](sub) */
  const Views = {};
  let cleanups = [];
  function onLeave(fn) { cleanups.push(fn); }
  function route() {
    cleanups.forEach(fn => { try { fn(); } catch (e) {} });
    cleanups = [];
    const [name, sub] = (location.hash.slice(1) || 'home').split('/');
    const view = Views[name] ? name : 'home';
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + view));
    document.body.classList.toggle('is-start', view === 'start');
    const el = document.getElementById('view');
    Views[view](el, sub);
    window.scrollTo(0, 0);
  }

  /* UI 조각 (HTML 문자열) */
  const ui = {
    likert(name, val, labels, nums = true, cls = '') {
      return `<div class="likert${nums ? ' num' : ''}${cls ? ' ' + cls : ''}" style="--n:${labels.length}" role="radiogroup">${labels.map((l, i) =>
        `<label><input type="radio" name="${name}" value="${i}" ${val === i ? 'checked' : ''}>${nums ? `<b>${i}</b>` : ''}<span>${l}</span></label>`).join('')}</div>`
        + (nums ? `<div class="lk-ends"><span>0 ${labels[0]}</span><span>${labels.length - 1} ${labels[labels.length - 1]}</span></div>` : '');
    },
    slider(id, label, val = 50, ends = ['0', '100']) {
      return `<div class="slider"><div class="top"><span>${label}</span><output id="${id}-o">${val}</output></div>
        <input type="range" id="${id}" min="0" max="100" step="5" value="${val}" aria-label="${esc(label)}">
        <div class="ends"><span>${ends[0]}</span><span>${ends[1]}</span></div></div>`;
    },
    bindSliders(root) {
      root.querySelectorAll('.slider input[type=range]').forEach(r => {
        r.addEventListener('input', () => { const o = document.getElementById(r.id + '-o'); if (o) o.textContent = r.value; });
      });
    },
    checks(name, items, selected = []) {
      return `<div class="checks">${items.map(it => `<label><input type="checkbox" name="${name}" value="${esc(it.id)}" ${selected.includes(it.id) ? 'checked' : ''}><span>${esc(it.label)}</span></label>`).join('')}</div>`;
    },
    steps(labels, cur) {
      return `<div class="steps" aria-label="진행 단계">${labels.map((l, i) => `<span class="${i === cur ? 'on' : i < cur ? 'done' : ''}">${i + 1}. ${l}</span>`).join('')}</div>`;
    },
    /* 쓰던 내용 자동 임시저장: key별로 localStorage에 보관, 다시 열면 복원. 제출 성공 시 clear() */
    autosave(root, key) {
      const K = 'cwsad.draft.' + key;
      const fields = () => [...root.querySelectorAll('input, textarea, select')].filter(e => e.type !== 'file' && (e.id || e.name));
      const save = () => {
        const d = {};
        fields().forEach(e => {
          if (e.type === 'radio') { if (e.checked) d['r:' + e.name] = e.value; }
          else if (e.type === 'checkbox') { (d['c:' + e.name] = d['c:' + e.name] || []); if (e.checked) d['c:' + e.name].push(e.value); }
          else if (e.id) d['v:' + e.id] = e.value;
        });
        try { localStorage.setItem(K, JSON.stringify(d)); } catch (err) {}
      };
      let d = null;
      try { d = JSON.parse(localStorage.getItem(K)); } catch (err) {}
      if (d) {
        fields().forEach(e => {
          if (e.type === 'radio') { if (d['r:' + e.name] !== undefined) e.checked = d['r:' + e.name] === e.value; }
          else if (e.type === 'checkbox') { if (d['c:' + e.name]) e.checked = d['c:' + e.name].includes(e.value); }
          else if (e.id && d['v:' + e.id] !== undefined) { e.value = d['v:' + e.id]; if (e.type === 'range') { const o = document.getElementById(e.id + '-o'); if (o) o.textContent = e.value; } }
        });
        const f = root.matches('form') ? root : root.querySelector('form');
        if (f) f.dispatchEvent(new Event('change', { bubbles: true }));
      }
      root.addEventListener('input', save);
      root.addEventListener('change', save);
      return { restored: !!d, clear() { try { localStorage.removeItem(K); } catch (err) {} } };
    },
    radioVal(root, name) { const r = root.querySelector(`input[name="${name}"]:checked`); return r ? +r.value : null; },
    checkedVals(root, name) { return [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value); },
    num(root, id) { const e = root.querySelector('#' + id); return e ? +e.value : null; },
    val(root, id) { const e = root.querySelector('#' + id); return e ? e.value.trim() : ''; },
  };

  /* 차트 */
  const chart = {
    bars(rows) {
      return `<div class="bars">${rows.map(r => `<div class="bar"><span class="lab">${esc(r.label)}</span>
        <div class="track"><div class="fill ${r.cls || ''}" style="width:${Math.max(0, Math.min(100, r.value / r.max * 100))}%"></div></div>
        <span class="v">${esc(r.text ?? r.value)}</span></div>`).join('')}</div>`;
    },
    compare(rows, names = ['전', '후']) {
      return `<div class="legend"><span><i style="background:var(--c2)"></i>${names[0]}</span><span><i style="background:var(--c1)"></i>${names[1]}</span></div>
      <div class="cmp">${rows.map(r => `<div class="row"><span>${esc(r.label)}</span><div class="pair">
        <div><i style="width:${r.a}%;background:var(--c2)"></i><span>${r.a}</span></div>
        <div><i style="width:${r.b}%;background:var(--c1)"></i><span>${r.b}</span></div></div></div>`).join('')}</div>`;
    },
    /* series: [{name, color, points:[number|null]}], labels: x 라벨 */
    line(series, labels, max = 100) {
      /* 좁은 화면에서는 viewBox를 줄여 축 글자가 작아지지 않게 */
      const narrow = window.innerWidth < 600;
      const W = narrow ? 340 : 640, H = narrow ? 220 : 220, L = 30, R = 10, T = 12, B = 30;
      const n = Math.max(labels.length, 1);
      const x = i => n === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (n - 1);
      const y = v => T + (1 - v / max) * (H - T - B);
      const grid = [0, 25, 50, 75, 100].map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('');
      const step = Math.ceil(n / (narrow ? 4 : 8));
      const xl = labels.map((l, i) => i % step === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="${n > 1 && i === 0 ? 'start' : n > 1 && i === n - 1 ? 'end' : 'middle'}">${esc(l)}</text>` : '').join('');
      const lines = series.map(s => {
        const pts = s.points.map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"/>` + pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${s.color}"/>`).join('');
      }).join('');
      return `<svg class="line" viewBox="0 0 ${W} ${H}" role="img" aria-label="추세 그래프">${grid}${xl}${lines}</svg>
        <div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
    },
  };

  /* 안전 안내 (주간 점검 악화 / 선별 높음) */
  const safety = {
    weeklyNote(weekly) {
      const a = CWScoring.weeklyAlert(weekly);
      if (!a) return '';
      if (a.type === 'high') return `<div class="note danger"><b>최근 2주 연속 점수가 매우 높아요 (평균 ${a.value}).</b> 혼자 버티기보다 전문가와 이야기할 때입니다. 사회불안은 증상이 심할수록 혼자 하는 것보다 전문가가 함께하는 치료의 효과가 큽니다. 정신건강의학과나 지역 정신건강복지센터(정신건강위기상담전화 <b>1577-0199</b>)에 연락해 보세요. 죽고 싶은 생각이 든다면 지금 바로 <b>109</b>에 전화하세요.</div>`;
      return `<div class="note warn"><b>첫 점검 때보다 점수가 ${a.delta}점 올랐어요.</b> 실험을 시작하면 불안이 잠시 오를 수 있고, 이는 흔한 일입니다. 하지만 2주 넘게 계속 나빠진다면 실험의 난이도를 낮추고, 전문가와 상의해 보세요(정신건강위기상담전화 <b>1577-0199</b>).</div>`;
    },
    screenNote(screens) {
      const s = screens[0];
      if (!s) return '';
      if (s.result.risk) return `<div class="note danger"><b>최근 선별에서 죽고 싶거나 스스로를 해치고 싶은 생각이 있다고 답하셨어요.</b> 이 과정보다 사람과의 대화가 먼저입니다. 자살예방상담전화 <b>109</b> · 정신건강위기상담전화 <b>1577-0199</b> (24시간).</div>`;
      if (s.result.level === 'high') return `<div class="note warn"><b>혼자보다 전문가와 함께할 때 더 효과적일 수 있어요.</b> 최근 선별 결과가 "높음"이었습니다. 연구에 따르면 증상이 심할수록 혼자 하는 프로그램보다 치료자가 안내하는 치료의 이점이 큽니다. 정신건강의학과나 인지행동치료를 하는 임상심리전문가를 먼저 만나 보시길 권합니다. 이 과정은 상담과 함께 쓰는 보조 자료로 활용하면 좋습니다.</div>`;
      return '';
    },
  };

  window.CW = { Store, esc, uid, today, fmtDate, Views, route, onLeave, ui, chart, safety };
})();
