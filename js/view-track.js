/* 기록과 추적 */
(function () {
  const { Views, Store, esc, uid, fmtDate, ui, chart } = CW;
  const C = CONTENT;
  const WK = [
    ['anx', '지난 한 주, 사회적 상황에서의 불안', ['전혀', '극도로']],
    ['avoid', '지난 한 주, 사회적 상황을 피한 정도', ['전혀', '항상']],
    ['self', '지난 한 주, 자기초점(나를 점검한 정도)', ['전혀', '항상']],
    ['rum', '지난 한 주, 끝난 뒤 곱씹은 정도', ['전혀', '항상']],
  ];
  const short = iso => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };

  Views.track = function (el) {
    const d = Store.get();
    const wk = d.weekly.slice().reverse();
    const pr = d.profiles.slice().reverse();
    const beliefRows = [
      ...d.exp.e1.map(r => ({ date: r.date, k: 'E1', t: r.pred || '안전행동을 내려놓으면 더 나빠질 것', a: r.before, b: r.after })),
      ...d.exp.e4.filter(r => r.status === 'done').map(r => ({ date: r.date, k: 'E4', t: r.pred, a: r.before, b: r.after })),
      ...d.exp.e6.map(r => ({ date: r.date, k: 'E6', t: `"${r.event}"에서 이상해 보였을 정도`, a: r.before, b: r.after })),
      ...d.exp.e2.map(r => ({ date: r.date, k: 'E2', t: '영상 속 내가 불안해 보일 정도 (예측→관찰)', a: r.pred.anx, b: r.obs.anx })),
    ].filter(r => r.a != null && r.b != null).sort((x, y) => y.date.localeCompare(x.date));
    const total = Object.values(d.exp).reduce((s, a) => s + a.length, 0);

    el.innerHTML = `
      <div class="eyebrow">기록</div>
      <h1>변화 살펴보기</h1>
      <p class="lead">치료에서는 매주 짧은 평정으로 변화를 확인하고, 실험마다 예측을 믿는 정도가 어떻게 바뀌는지 기록합니다.</p>
      ${Store.available() ? '' : '<div class="note warn"><b>브라우저 저장소를 쓸 수 없어요.</b> 시크릿 창이거나 사이트 데이터가 차단된 상태일 수 있습니다. 이 상태에서는 기록이 저장되지 않습니다.</div>'}

      <h2>주간 점검</h2>
      <form id="wf" class="card" novalidate>
        <p class="small muted" style="margin-top:0">일주일에 한 번, 같은 요일에 하면 추세를 보기 좋습니다.</p>
        ${WK.map(([k, l, e]) => ui.slider('w' + k, l, 50, e)).join('')}
        <div class="btns"><button class="btn" type="submit">이번 주 저장</button></div>
      </form>
      ${CW.safety.weeklyNote(d.weekly)}
      ${wk.length ? `<div class="card">${chart.line(WK.map(([k, l], i) => ({ name: l.replace('지난 한 주, ', ''), color: ['var(--warn)', 'var(--muted)', 'var(--c1)', 'var(--danger)'][i], points: wk.map(w => w[k]) })), wk.map(w => short(w.date)))}</div>` : '<p class="muted small">첫 주간 점검을 저장하면 추세 그래프가 나타납니다.</p>'}

      <h2>예측을 믿는 정도의 변화</h2>
      ${beliefRows.length ? `<div class="card">${chart.compare(beliefRows.slice(0, 12).map(r => ({ label: `${r.k} · ${short(r.date)} · ${r.t.length > 40 ? r.t.slice(0, 40) + '…' : r.t}`, a: r.a, b: r.b })), ['실험 전·예측', '실험 후·관찰'])}</div>` : '<p class="muted small">E1·E2·E4·E6 실험을 마치면 여기에 전후 비교가 쌓입니다.</p>'}

      ${pr.length > 1 ? `<h2>모델 요소 프로파일 변화</h2><div class="card">${chart.line(Object.keys(C.domains).map((k, i) => ({ name: C.domains[k].name, color: ['var(--warn)', 'var(--c1)', 'var(--danger)', 'var(--muted)'][i], points: pr.map(p => Math.round(p.scores[k].mean / 4 * 100)) })), pr.map(p => short(p.date)))}<p class="small muted">영역 평균(0~4)을 0~100으로 환산</p></div>` : ''}

      <h2>전체 기록 <span class="muted small">실험 ${total}개</span></h2>
      ${['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map(k => d.exp[k].length ? `<details><summary>${k.toUpperCase()} · ${d.exp[k].length}개</summary><div class="list" style="margin-top:10px">${d.exp[k].map(r => recHTML(k, r)).join('')}</div></details>` : '').join('')}
      ${d.screens.length ? `<details><summary>증상 선별 · ${d.screens.length}회</summary><div class="list" style="margin-top:10px">${d.screens.map(s => `<div class="rec"><div class="meta">${fmtDate(s.date)} · 가능성 ${({ low: '낮음', mid: '중간', high: '높음' })[s.result.level]} · 핵심 ${s.result.core}/20</div></div>`).join('')}</div></details>` : ''}

      <h2>치료자와 공유하기</h2>
      <p>상담을 받고 있다면 평가 결과, 사례개념화, 실험 기록을 한 장으로 정리해 보여 줄 수 있습니다.</p>
      <div class="btns" style="margin-top:12px"><a class="btn ghost" href="#summary">치료자용 요약 보기</a></div>

      <h2>데이터 관리</h2>
      <div class="card">
        <p style="margin-top:0">기록은 이 브라우저에만 있습니다. 브라우저 데이터를 지우면 함께 사라지니, 가끔 백업 파일로 내보내 두세요. 다른 기기에서 가져오기로 이어서 쓸 수 있습니다.</p>
        <div class="btns"><button class="btn ghost" id="exp" type="button">백업 파일 내보내기</button>
          <label class="btn ghost" for="imp" style="cursor:pointer">백업 가져오기</label><input type="file" id="imp" accept="application/json,.json" hidden>
          <button class="btn danger" id="clr" type="button">모든 기록 삭제</button></div>
        <p id="dmsg" class="small" role="status"></p>
      </div>`;
    ui.bindSliders(el);
    const $ = s => el.querySelector(s);
    $('#wf').addEventListener('submit', e => {
      e.preventDefault();
      const rec = { id: uid(), date: new Date().toISOString() };
      WK.forEach(([k]) => (rec[k] = ui.num(el, 'w' + k)));
      Store.save(d => d.weekly.unshift(rec));
      Views.track(el);
    });
    $('#exp').onclick = () => {
      const blob = new Blob([Store.exportText()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `social-anxiety-workbook-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      $('#dmsg').textContent = '백업 파일을 내려받았어요.';
    };
    $('#imp').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then(t => {
        const err = Store.importText(t);
        if (err) { $('#dmsg').textContent = err; return; }
        Views.track(el);
        el.querySelector('#dmsg').textContent = '백업을 가져왔어요.';
      });
    });
    $('#clr').onclick = e => {
      const b = e.currentTarget;
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '정말 모두 삭제할까요? 한 번 더 누르세요'; return; }
      Store.clear(); Views.track(el);
    };
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '한 번 더 누르면 삭제'; return; }
      const [k, id] = b.dataset.del.split(':');
      Store.save(d => (d.exp[k] = d.exp[k].filter(x => x.id !== id)));
      Views.track(el);
    }));
  };

  function recHTML(k, r) {
    const del = `<div style="text-align:right"><button class="btn small danger" data-del="${k}:${r.id}" type="button">삭제</button></div>`;
    const learn = r.learn ? `<blockquote>${esc(r.learn)}</blockquote>` : '';
    let body = '';
    if (k === 'e1') body = `<div class="body">${esc(r.topic)}</div>${chart.compare([{ label: '불안', a: r.A.anx, b: r.B.anx }, { label: '보였을 불안', a: r.A.look, b: r.B.look }], ['조건 A', '조건 B'])}`;
    if (k === 'e2') body = `${chart.compare([{ label: '불안해 보임', a: r.pred.anx, b: r.obs.anx }, { label: '이상해 보임', a: r.pred.odd, b: r.obs.odd }], ['예측', '관찰'])}`;
    if (k === 'e3') body = `<div class="body small">바깥 주의 쉬움 ${r.easy} · 주의 조절 ${r.ctrl}</div>`;
    if (k === 'e4') body = `<div class="body"><b style="font-weight:500">${esc(r.situation)}</b>\n${esc(r.pred)}</div><div class="body small muted">${r.status === 'done' ? `믿음 ${r.before}% → ${r.after}%` : '결과 기록 전 · 실험실 E4에서 기록하세요'}</div>`;
    if (k === 'e5') body = `<div class="body small">${esc(r.label)} · 예측 ${r.pred}% → 실제 ${r.actual}% (${r.counts.n}명)</div>`;
    if (k === 'e6') body = `<div class="body"><b style="font-weight:500">${esc(r.event)}</b>${r.evidence ? '\n증거: ' + esc(r.evidence) : ''}</div><div class="body small muted">이상해 보였을 정도 ${r.before} → ${r.after}${r.plan ? ' · 계획: ' + esc(r.plan) : ''}</div>`;
    return `<div class="rec"><div class="meta">${fmtDate(r.date)}</div>${body}${learn}${del}</div>`;
  }
})();
