/* 자기평가: A 증상 선별 / B 모델 요소 프로파일 / C 사례개념화 */
(function () {
  const { Views, Store, esc, uid, fmtDate, ui, chart } = CW;
  const C = CONTENT;
  const levelName = { low: '낮음', mid: '중간', high: '높음' };

  Views.assess = function (el, sub) {
    if (sub === 'screen') return screen(el);
    if (sub === 'profile') return profile(el);
    if (sub === 'formulation') return formulation(el);
    hub(el);
  };

  function hub(el) {
    const d = Store.get();
    const ls = d.screens[0], lp = d.profiles[0], lf = d.formulations[0];
    el.innerHTML = `
      <div class="eyebrow">자기평가</div>
      <h1>지금 나의 사회불안 이해하기</h1>
      <p class="lead">세 단계로 진행합니다. 증상이 어느 정도인지 살피고, 모델의 어느 요소가 두드러지는지 확인한 뒤, 최근 장면으로 나만의 모델 도식을 그립니다.</p>
      <div class="note warn"><b>먼저 읽어 주세요.</b> 모든 문항은 이 워크북을 위해 DSM-5 진단기준과 Clark &amp; Wells 모델을 바탕으로 새로 작성했습니다. 타당도가 검증된 척도가 아니고, 결과는 진단이 아닙니다. 진단은 정신건강 전문가의 면담으로만 가능합니다.</div>
      <div class="grid2" style="margin-top:18px">
        <a class="tilecard" href="#assess/screen"><span class="tag">A · 약 3분</span><h3>증상 선별</h3><p>DSM-5 사회불안장애 기준을 바탕으로 한 10문항</p>
          ${ls ? `<p style="margin-top:8px"><span class="pill ${ls.result.level === 'low' ? 'ok' : 'warn'}">최근 ${fmtDate(ls.date)} · 가능성 ${levelName[ls.result.level]}</span></p>` : ''}</a>
        <a class="tilecard" href="#assess/profile"><span class="tag">B · 약 6분</span><h3>모델 요소 프로파일</h3><p>신념, 자기초점, 안전행동, 예기·사후 처리 26문항</p>
          ${lp ? `<p style="margin-top:8px"><span class="pill">최근 ${fmtDate(lp.date)}</span></p>` : ''}</a>
        <a class="tilecard" href="#assess/formulation"><span class="tag">C · 약 10분</span><h3>나의 사례개념화</h3><p>최근 불안했던 장면으로 Clark &amp; Wells 도식 그리기</p>
          ${lf ? `<p style="margin-top:8px"><span class="pill">저장된 도식 ${d.formulations.length}개</span></p>` : ''}</a>
      </div>`;
  }

  /* ---------- A. 증상 선별 ---------- */
  function screen(el) {
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 A</div>
      <h1>증상 선별</h1>
      <p class="lead">지난 몇 달을 떠올리며, 각 문장이 나에게 얼마나 해당하는지 골라 주세요.</p>
      <form id="f" novalidate>
        <div class="card">
          ${C.screenItems.map((q, i) => `<div class="q"><p class="qt"><b>${i + 1}</b>${q.text}</p>${ui.likert(q.id, null, C.freq5)}</div>`).join('')}
          <div class="q"><p class="qt"><b>8</b>이런 어려움이 얼마나 오래 계속되었나요?</p>
            ${ui.likert('duration', null, C.durationOpts.map(o => o.label), false)}</div>
          <div class="q"><p class="qt"><b>9</b>특히 불안한 상황을 모두 골라 주세요. <span class="muted small">(선택)</span></p>
            ${ui.checks('sit', C.situations)}</div>
          <div class="q"><p class="qt"><b>10</b>지난 2주 동안, 죽고 싶다는 생각이나 스스로를 해치고 싶다는 생각이 든 적이 있나요?</p>
            ${ui.likert('suicide', null, C.suicideOpts, false)}</div>
        </div>
        <p id="miss" class="small muted"></p>
        <div class="btns"><button class="btn" id="go" type="submit" disabled>결과 보기</button></div>
      </form>`;
    const f = el.querySelector('#f');
    const read = () => {
      const a = {};
      C.screenItems.forEach(q => (a[q.id] = ui.radioVal(f, q.id)));
      const di = ui.radioVal(f, 'duration');
      a.duration = di == null ? null : C.durationOpts[di].id;
      a.suicide = ui.radioVal(f, 'suicide');
      return a;
    };
    const check = () => {
      const a = read();
      const missing = Object.entries(a).filter(([, v]) => v == null).length;
      f.querySelector('#go').disabled = missing > 0;
      f.querySelector('#miss').textContent = missing ? `${missing}개 문항이 남았어요.` : '';
    };
    f.addEventListener('change', check);
    const draft = ui.autosave(f, 'screen');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const answers = read();
      const result = CWScoring.screenResult(answers);
      if (!result) return;
      const rec = { id: uid(), date: new Date().toISOString(), answers, situations: ui.checkedVals(f, 'sit'), result };
      Store.save(d => d.screens.unshift(rec));
      draft.clear();
      screenResult(el, rec);
    });
  }

  function screenResult(el, rec) {
    window.scrollTo(0, 0);
    const r = rec.result;
    const text = {
      high: '사회불안장애의 주요 특징과 상당 부분 일치하는 응답입니다. 이것은 진단이 아니지만, 정신건강의학과나 임상심리전문가의 평가를 받아 보기를 권합니다. 사회불안은 효과가 잘 확인된 치료가 있는 어려움입니다.',
      mid: '사회불안의 특징이 일부 나타납니다. 지속 기간과 생활에 미치는 영향에 따라 의미가 달라질 수 있습니다. 어려움이 계속되거나 커지면 전문가와 상의해 보세요.',
      low: '현재 응답으로는 사회불안장애의 특징이 두드러지지 않습니다. 그래도 특정 상황에서 불안을 느낀다면 이 워크북의 실험이 도움이 될 수 있습니다.',
    };
    const sits = C.situations.filter(s => rec.situations.includes(s.id)).map(s => s.label);
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 A · 결과</div>
      <h1>선별 결과</h1>
      ${r.risk ? `<div class="note danger"><b>혼자 견디지 않으셨으면 해요.</b> 죽고 싶거나 스스로를 해치고 싶은 생각이 든다고 답하셨습니다. 지금 바로 <b>자살예방상담전화 109</b> 또는 <b>정신건강위기상담전화 1577-0199</b>(24시간)에 연락하세요. 위급하면 <b>119</b>에 전화하세요. 이 워크북의 실험보다 전문가와의 대화가 먼저입니다.</div>` : ''}
      <div class="card">
        <div class="eyebrow">사회불안장애 특징과의 일치 가능성</div>
        <h2 style="margin-top:4px;border:0;padding:0">${levelName[r.level]}</h2>
        <p>${text[r.level]}</p>
        ${chart.bars([
          { label: '핵심 증상 (1~5번 합)', value: r.core, max: 20, text: `${r.core} / 20`, cls: r.core >= 13 ? 'high' : r.core >= 8 ? 'mid' : '' },
          { label: '생활 지장·괴로움', value: r.impairment, max: 4, text: `${r.impairment} / 4`, cls: r.impairment >= 3 ? 'high' : r.impairment >= 2 ? 'mid' : '' },
        ])}
        <p class="small muted">지속 기간: ${esc(C.durationOpts.find(o => o.id === r.duration).label)}. DSM-5는 보통 6개월 이상 지속을 기준으로 봅니다.</p>
        ${sits.length ? `<p class="small"><b>특히 불안한 상황</b> · ${sits.map(esc).join(', ')}</p>` : ''}
      </div>
      ${r.level === 'high' && !r.risk ? `<div class="card"><h3>전문가와 먼저 이야기해 보세요</h3>
        <p>증상이 심한 경우, 혼자 하는 프로그램보다 치료자가 안내하는 치료의 이점이 더 크다는 연구 결과가 있습니다. 이 워크북의 기반인 CT-SAD도 훈련받은 치료자가 진행할 때 효과가 확인되었습니다.</p>
        <ul class="tight"><li>정신건강의학과: 진단 평가와 치료 선택지 상담</li><li>인지행동치료를 하는 임상심리전문가</li><li>지역 정신건강복지센터: 무료 상담 (1577-0199)</li></ul>
        <p class="small muted">이 워크북은 상담과 함께 쓰는 보조 자료로 활용할 수 있습니다.</p></div>` : ''}
      <div class="note"><b>판정 방식</b> · "높음"은 두려움(1번)과 부정적 평가 걱정(2번)이 "꽤" 이상, 회피·견딤(4번)이 "보통" 이상, 생활 지장 또는 괴로움이 "보통" 이상이고, 6개월 이상 지속된 경우입니다. 다른 질환이나 약물의 영향(DSM-5 기준 H~J)은 이 선별로 판단할 수 없습니다.</div>
      <div class="btns"><a class="btn" href="#assess/profile">다음: 모델 요소 프로파일</a><a class="btn ghost" href="#assess">자기평가로</a></div>`;
  }

  /* ---------- B. 모델 요소 프로파일 ---------- */
  function profile(el) {
    const groups = Object.keys(C.domains);
    let n = 0;
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 B</div>
      <h1>모델 요소 프로파일</h1>
      <p class="lead">사회적 상황에서의 나를 떠올리며, 각 문장에 얼마나 동의하는지 또는 얼마나 자주 그런지 골라 주세요. 정답은 없습니다.</p>
      <form id="f" novalidate>
        ${groups.map(g => `<div class="card"><div class="eyebrow">${C.domains[g].en}</div><h3 style="margin-top:2px">${C.domains[g].name}</h3>
          ${C.profileItems.filter(i => i.domain === g).map(q => `<div class="q"><p class="qt"><b>${++n}</b>${q.text}</p>${ui.likert(q.id, null, C.freq5)}</div>`).join('')}</div>`).join('')}
        <p id="miss" class="small muted"></p>
        <div class="btns"><button class="btn" id="go" type="submit" disabled>프로파일 보기</button></div>
      </form>`;
    const f = el.querySelector('#f');
    const read = () => Object.fromEntries(C.profileItems.map(q => [q.id, ui.radioVal(f, q.id)]));
    f.addEventListener('change', () => {
      const miss = Object.values(read()).filter(v => v == null).length;
      f.querySelector('#go').disabled = miss > 0;
      f.querySelector('#miss').textContent = miss ? `${miss}개 문항이 남았어요.` : '';
    });
    const draft = ui.autosave(f, 'profile');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const answers = read();
      const scores = CWScoring.profileScores(answers, C.profileItems);
      const rec = { id: uid(), date: new Date().toISOString(), answers, scores };
      Store.save(d => d.profiles.unshift(rec));
      draft.clear();
      profileResult(el, rec);
    });
  }

  function profileResult(el, rec) {
    window.scrollTo(0, 0);
    const s = rec.scores;
    const order = Object.keys(C.domains).sort((a, b) => s[b].mean - s[a].mean);
    const top = order[0];
    const next = { beliefs: ['#lab/e4', 'E4 행동실험'], focus: ['#lab/e2', 'E2 비디오 피드백'], safety: ['#lab/e1', 'E1 비교 실험'], processing: ['#lab/e6', 'E6 곱씹기 점검'] };
    const highBeliefs = C.profileItems.filter(i => i.domain === 'beliefs' && rec.answers[i.id] >= 3);
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 B · 결과</div>
      <h1>나의 모델 요소 프로파일</h1>
      <div class="card">
        <p class="small muted">각 영역 평균 (0~4)</p>
        ${chart.bars(order.map(k => ({ label: C.domains[k].name, value: s[k].mean, max: 4, text: s[k].mean.toFixed(1), cls: s[k].level === 'high' ? 'high' : s[k].level === 'mid' ? 'mid' : '' })))}
        <p class="small muted">0~1.4 낮음 · 1.5~2.4 중간 · 2.5~4 높음. 같은 사람 안에서 영역을 비교하는 용도이며, 다른 사람과 비교할 수 있는 규준 점수가 아닙니다.</p>
      </div>
      ${order.map(k => `<div class="card">
        <div class="eyebrow">${C.domains[k].en}</div>
        <h3 style="margin-top:2px">${C.domains[k].name} <span class="pill ${s[k].level === 'low' ? 'ok' : 'warn'}">${levelName[s[k].level]}</span></h3>
        ${chart.bars(Object.entries(s[k].subs).map(([sub, v]) => ({ label: C.domains[k].subs[sub], value: v, max: 4, text: v.toFixed(1), cls: v >= 2.5 ? 'high' : v >= 1.5 ? 'mid' : '' })))}
        <p>${C.domains[k].read[s[k].level]}</p>
        ${k === 'beliefs' && highBeliefs.length ? `<p class="small"><b>"꽤" 이상 동의한 신념</b></p><ul class="tight small">${highBeliefs.map(b => `<li>${esc(b.text)}</li>`).join('')}</ul><p class="small muted">이 신념들은 사례개념화(C)와 행동실험(E4)에 자동으로 불러옵니다.</p>` : ''}
      </div>`).join('')}
      <div class="btns"><a class="btn" href="#assess/formulation">다음: 나의 사례개념화</a><a class="btn ghost" href="${next[top][0]}">가장 높은 영역 실험: ${next[top][1]}</a></div>`;
  }

  /* ---------- C. 사례개념화 ---------- */
  function formulation(el) {
    const d = Store.get();
    const lp = d.profiles[0];
    const beliefItems = C.profileItems.filter(i => i.domain === 'beliefs').map(i => ({ id: i.id, label: i.text }));
    const preBeliefs = lp ? beliefItems.filter(b => lp.answers[b.id] >= 3).map(b => b.id) : [];
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 C</div>
      <h1>나의 사례개념화</h1>
      <p class="lead">최근에 불안했던 구체적인 장면 하나를 떠올려 주세요. 그 장면을 Clark &amp; Wells 모델의 칸에 하나씩 채우면 나의 유지 고리가 보입니다. CT-SAD 첫 회기에 치료자와 함께 하는 작업입니다.</p>
      ${d.formulations.length ? `<details><summary>저장된 도식 ${d.formulations.length}개 보기</summary><div class="list" style="margin-top:12px">${d.formulations.map(f => `<div class="rec"><div class="meta">${fmtDate(f.date)} · ${esc(f.situation)}</div><div class="btns" style="margin-top:8px"><button class="btn small ghost" data-show="${f.id}">도식 보기</button><button class="btn small danger" data-del="${f.id}">삭제</button></div></div>`).join('')}</div></details>` : ''}
      <form id="f" novalidate>
        <div class="card">
          <h3>1. 상황</h3>
          <label class="f" for="sit">언제, 어디서, 누구와, 무엇을 하던 중이었나요?<small>예: 월요일 팀 회의에서 진행 상황을 보고하던 중</small></label>
          <input type="text" id="sit" maxlength="200">
          ${ui.slider('anx', '그때 불안은 얼마나 강했나요?', 70, ['전혀', '극도로'])}
        </div>
        <div class="card">
          <h3>2. 사회적 위험: 자동적 사고</h3>
          <label class="f" for="nat">그 순간 머릿속을 스친 생각은 무엇이었나요?<small>무슨 일이 일어날까 봐, 사람들이 나를 어떻게 볼까 봐 두려웠나요? 예: "목소리 떨리는 걸 다 알아챌 거야. 준비도 안 된 무능한 사람으로 보겠지."</small></label>
          <textarea id="nat" maxlength="600"></textarea>
          <label class="f">그 생각 밑에 깔린 신념<small>자기평가 B에서 "꽤" 이상 동의한 신념은 미리 선택되어 있어요.</small></label>
          ${ui.checks('bel', beliefItems, preBeliefs)}
          <input type="text" id="belx" placeholder="다른 신념이 있다면 적어 주세요" maxlength="200">
        </div>
        <div class="card">
          <h3>3. 사회적 대상으로서의 자기</h3>
          <label class="f">그때 내 모습이 머릿속에 그려졌나요? 어떤 시점이었나요?</label>
          ${ui.likert('pov', null, ['밖에서 나를 보는 장면', '내 눈으로 본 장면', '이미지 없음·모르겠음'], false)}
          <label class="f" for="img">남들 눈에 내가 어떻게 보였을 것 같나요?<small>가능한 한 구체적으로. 예: "얼굴이 토마토처럼 빨갛고, 목소리가 덜덜 떨리고, 눈을 못 마주치는 어색한 사람"</small></label>
          <textarea id="img" maxlength="600"></textarea>
          ${ui.slider('imgb', '그때 그 모습이 실제라고 얼마나 확신했나요?', 70, ['전혀', '완전히'])}
        </div>
        <div class="card">
          <h3>4. 안전행동</h3>
          <label class="f">불안을 줄이거나 들키지 않으려고 무엇을 했나요?<small>머릿속으로 한 것도 포함됩니다.</small></label>
          ${ui.checks('sb', C.safetyList)}
          <input type="text" id="sbx" placeholder="그 밖의 행동" maxlength="200">
        </div>
        <div class="card">
          <h3>5. 신체·인지 증상</h3>
          ${ui.checks('sy', C.symptomList)}
          <input type="text" id="syx" placeholder="그 밖의 증상" maxlength="200">
        </div>
        <div class="card">
          <h3>6. 예기 처리와 사후 처리</h3>
          <label class="f" for="pre">그 상황 전에 무엇을 걱정하거나 떠올렸나요?</label>
          <textarea id="pre" maxlength="400"></textarea>
          <label class="f" for="post">끝난 뒤 무엇을 곱씹었나요?</label>
          <textarea id="post" maxlength="400"></textarea>
        </div>
        <p id="miss" class="small muted">상황과 자동적 사고는 꼭 적어 주세요.</p>
        <p class="draftnote">쓰던 내용은 이 기기에 자동으로 임시 저장돼요. 나중에 이어서 써도 괜찮아요.</p>
        <div class="btns"><button class="btn" type="submit">도식 만들기</button></div>
      </form>
      <div id="out"></div>`;
    ui.bindSliders(el);
    const f = el.querySelector('#f');
    const draft = ui.autosave(f, 'formulation');
    el.querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', () => {
      const rec = Store.get().formulations.find(x => x.id === b.dataset.show);
      if (rec) showFormu(el, rec);
    }));
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '한 번 더 누르면 삭제'; return; }
      Store.save(d => (d.formulations = d.formulations.filter(x => x.id !== b.dataset.del)));
      formulation(el);
    }));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const sit = ui.val(f, 'sit'), nat = ui.val(f, 'nat');
      if (!sit || !nat) { f.querySelector('#miss').innerHTML = '<b style="color:var(--danger)">상황과 자동적 사고를 적어 주세요.</b>'; return; }
      const povI = ui.radioVal(f, 'pov');
      const rec = {
        id: uid(), date: new Date().toISOString(), situation: sit, anxiety: ui.num(f, 'anx'), thought: nat,
        beliefs: ui.checkedVals(f, 'bel').map(id => C.profileItems.find(i => i.id === id).text).concat(ui.val(f, 'belx') ? [ui.val(f, 'belx')] : []),
        pov: povI == null ? null : ['observer', 'field', 'none'][povI], image: ui.val(f, 'img'), imageBelief: ui.num(f, 'imgb'),
        safety: ui.checkedVals(f, 'sb'), safetyOther: ui.val(f, 'sbx'),
        symptoms: ui.checkedVals(f, 'sy'), symptomsOther: ui.val(f, 'syx'),
        pre: ui.val(f, 'pre'), post: ui.val(f, 'post'),
      };
      Store.save(d => d.formulations.unshift(rec));
      draft.clear();
      showFormu(el, rec);
    });
  }

  function formuHTML(r) {
    const sb = C.safetyList.filter(s => r.safety.includes(s.id)).map(s => s.label).concat(r.safetyOther ? [r.safetyOther] : []);
    const sy = C.symptomList.filter(s => r.symptoms.includes(s.id)).map(s => s.label).concat(r.symptomsOther ? [r.symptomsOther] : []);
    const povT = { observer: '관찰자 시점', field: '내 눈으로 본 시점', none: '이미지 없음' }[r.pov] || '';
    const box = (k, t, cls = '') => `<div class="fbox ${cls}"><div class="k">${k}</div><div class="t">${t || '<span class="muted">비어 있음</span>'}</div></div>`;
    return `
      <div class="formu">
        ${box('상황', esc(r.situation) + (r.anxiety != null ? ` <span class="pill">불안 ${r.anxiety}</span>` : ''))}
        ${(r.beliefs || []).length ? `<div class="arr">↓ 활성화</div>${box('가정·신념', r.beliefs.map(esc).join('\n'))}` : ''}
        <div class="arr">↓</div>
        ${box('사회적 위험 · 자동적 사고', esc(r.thought), 'core')}
        <div class="arr">↓</div>
        ${box('사회적 대상으로서의 자기' + (povT ? ' · ' + povT : ''), esc(r.image) + (r.image && r.imageBelief != null ? ` <span class="pill">확신 ${r.imageBelief}</span>` : ''), 'self')}
        <div class="frow">
          ${box('안전행동', sb.map(esc).join('\n'))}
          ${box('신체·인지 증상', sy.map(esc).join('\n'))}
        </div>
        <div class="loopnote">안전행동과 증상은 자기 이미지를 강화하고, 자기 이미지는 다시 안전행동과 증상을 부릅니다</div>
        ${(r.pre || r.post) ? `<div class="frow">${box('예기 처리', esc(r.pre))}${box('사후 처리', esc(r.post))}</div>` : ''}
      </div>`;
  }

  function insights(r) {
    const out = [];
    if (r.pov === 'observer') out.push('밖에서 나를 보는 장면을 떠올렸다면, 그것은 실제 관찰이 아니라 <b>느낌으로 만든 이미지</b>입니다. E2 비디오 피드백으로 이미지와 실제 모습을 비교해 볼 수 있습니다.');
    if (r.safety.includes('cover')) out.push('몸에 힘을 주거나 가리는 행동은 떨림과 화끈거림을 <b>오히려 키우고</b>, 신경을 더 쓰게 만듭니다.');
    if (r.safety.includes('script') || r.safety.includes('monitor') || r.safety.includes('rehearse')) out.push('할 말을 준비하고 점검하는 동안 주의는 안으로 향합니다. 그래서 상대 말을 놓치고 대화가 더 어색해질 수 있습니다. 머릿속으로 하는 <b>숨은 안전행동</b>입니다.');
    if (r.safety.includes('eye') || r.safety.includes('quiet') || r.safety.includes('phone')) out.push('눈을 피하고 말을 아끼면 상대에게 <b>관심 없거나 차가운 사람</b>으로 보일 수 있습니다. 그러면 상대도 거리를 두고, 두려움이 "확인된" 것처럼 느껴집니다.');
    if (r.safety.length || r.safetyOther) out.push('아무 일이 없었다면 "안전행동 덕분"이라고 느꼈을 수 있습니다. 이 믿음 때문에 두려운 예측이 <b>검증되지 않은 채</b> 남습니다. E1에서 직접 확인해 보세요.');
    if (r.post) out.push('사후 곱씹기는 실제 상대 반응이 아니라 <b>불안한 느낌과 자기 이미지</b>를 재료로 합니다. 그래서 기억이 실제보다 나빠집니다. E6에서 점검해 보세요.');
    return out;
  }

  function showFormu(el, r) {
    window.scrollTo(0, 0);
    const ins = insights(r);
    el.innerHTML = `
      <a href="#assess" class="small">← 자기평가</a>
      <div class="eyebrow" style="margin-top:14px">자기평가 C · ${fmtDate(r.date)}</div>
      <h1>나의 유지 고리</h1>
      <p class="lead">이 장면에서 불안이 스스로를 유지한 방식입니다. 실험은 이 고리의 한 지점을 바꿔 보고, 결과가 예측과 같은지 확인하는 일입니다.</p>
      ${formuHTML(r)}
      ${ins.length ? `<div class="card"><h3>이 도식에서 보이는 것</h3><ul class="tight">${ins.map(i => `<li>${i}</li>`).join('')}</ul></div>` : ''}
      <div class="btns"><a class="btn" href="#lab/e1">이 고리로 E1 비교 실험</a><a class="btn ghost" href="#lab/e4">E4 행동실험 계획</a><a class="btn ghost" href="#assess/formulation">새 도식</a></div>`;
  }

  window.CWFormu = { formuHTML };
})();
