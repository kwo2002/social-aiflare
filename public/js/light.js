/* 간단 버전: 고르기만으로 패턴 보기 → 작은 연습 하나 → 해 보고 기록. 기록은 전문 워크북과 같은 저장소를 쓴다. */
(function () {
  const { Views, Store, esc, uid, fmtDate, ui, chart } = CW;
  const C = CONTENT;
  try { localStorage.setItem('cwsad.mode', 'light'); } catch (e) {}

  /* ---------- 선택지 ---------- */
  const SITS = C.situations.slice(0, 10);
  const FEARS = [
    { id: 'blank', label: '말이 막혀서 이상해 보일까 봐' },
    { id: 'shake', label: '떨리는 게 보일까 봐' },
    { id: 'blush', label: '얼굴이 빨개진 걸 들킬까 봐' },
    { id: 'boring', label: '지루하거나 어색한 사람으로 보일까 봐' },
    { id: 'reject', label: '나를 싫어하거나 무시할까 봐' },
  ];
  const IMAGES = [
    { id: 'red', label: '빨개진 얼굴' },
    { id: 'tremble', label: '떨리는 손이나 목소리' },
    { id: 'stiff', label: '굳은 표정' },
    { id: 'awk', label: '어색하게 서 있는 모습' },
    { id: 'none', label: '잘 모르겠어요' },
  ];
  const STEPS = [
    { key: 'sit', q: '최근에 긴장됐던 순간은 언제였나요?', hint: '하나만 골라 주세요. 가장 최근의 장면이 좋아요.', items: SITS, single: true },
    { key: 'fear', q: '그때 어떤 일이 생길까 봐 걱정됐나요?', hint: '여러 개 골라도 괜찮아요.', items: FEARS },
    { key: 'img', q: '그 순간, 남들 눈에 내가 어떻게 보였을 것 같았나요?', hint: '긴장하면 많은 사람이 "밖에서 나를 보는 장면"을 떠올려요.', items: IMAGES },
    { key: 'sb', q: '들키지 않으려고 이런 걸 했나요?', hint: '대부분 나도 모르게 하는 행동이에요.', items: C.safetyList },
    { key: 'sy', q: '몸은 어땠나요?', hint: '', items: C.symptomList },
  ];

  /* 연습 사다리: drop = 이 연습이 내려놓게 하는 안전행동 */
  const PRACTICES = [
    { id: 'eye1', lv: 1, drop: 'eye', text: '가게에서 계산할 때 점원과 눈을 한 번 맞추고 인사하기', pred: '상대가 이상하게 볼 것 같다' },
    { id: 'phone1', lv: 1, drop: 'phone', text: '기다리는 동안 휴대폰을 넣어 두고 주변 둘러보기', pred: '어색해 보일 것 같다' },
    { id: 'cover1', lv: 1, drop: 'cover', text: '대화할 때 손과 어깨에 힘을 빼고 편하게 두기', pred: '떨리는 게 보일 것 같다' },
    { id: 'quiet2', lv: 2, drop: 'quiet', text: '대화에서 평소보다 한 문장 더 말해 보기', pred: '말이 꼬여서 이상해 보일 것 같다' },
    { id: 'script2', lv: 2, drop: 'script', text: '미리 연습하지 않고 짧은 질문 하나 해 보기', pred: '말이 막힐 것 같다' },
    { id: 'monitor2', lv: 2, drop: 'monitor', text: '대화 중 "내가 어떻게 보일까" 대신 상대 말의 핵심 하나 기억하기', pred: '대화를 망칠 것 같다' },
    { id: 'hide2', lv: 2, drop: 'hide', text: '모임이나 수업에서 구석 대신 가운데쪽에 앉기', pred: '사람들이 쳐다볼 것 같다' },
    { id: 'rush3', lv: 3, drop: 'rush', text: '말하다가 일부러 2초 쉬어 보기', pred: '침묵이 어색해서 이상하게 볼 것 같다' },
    { id: 'ask3', lv: 3, drop: null, text: '가게에서 물건 위치를 묻거나 작은 부탁 하나 하기', pred: '귀찮아하거나 이상하게 볼 것 같다' },
    { id: 'check3', lv: 3, drop: null, text: '믿을 만한 사람 한 명에게 "나 아까 긴장해 보였어?" 물어보기', pred: '엄청 티 났다고 할 것 같다' },
  ];
  const LV = { 1: '가볍게 · 오늘 바로 해 볼 수 있어요', 2: '조금 더 · 익숙해졌다면', 3: '도전 · 자신감이 붙었다면' };
  const WHEN = [{ id: 'today', label: '오늘' }, { id: 'tomorrow', label: '내일' }, { id: 'week', label: '이번 주 안에' }];

  /* ---------- 공용 ---------- */
  const DK = 'cwsad.draft.lite-pattern';
  const loadDraft = () => { try { return JSON.parse(localStorage.getItem(DK)); } catch (e) { return null; } };
  const saveDraft = v => { try { localStorage.setItem(DK, JSON.stringify(v)); } catch (e) {} };
  const clearDraft = () => { try { localStorage.removeItem(DK); } catch (e) {} };
  const chip = (id, label, on, sub = '') => `<button class="chip" type="button" data-id="${esc(id)}" aria-pressed="${!!on}"><span>${esc(label)}${sub ? `<span class="sub">${sub}</span>` : ''}</span></button>`;
  const lbl = (list, id) => (list.find(x => x.id === id) || {}).label || '';
  /* 처음엔 값이 없는 슬라이더: 움직여야 기록된다 */
  const freshSlider = (id, label, ends) => `<div class="slider empty" id="${id}-w"><div class="top"><span>${label}</span><output id="${id}-o">–</output></div>
    <input type="range" id="${id}" min="0" max="100" step="5" value="50" aria-label="${esc(label)}">
    <div class="ends"><span>${ends[0]}</span><span>${ends[1]}</span></div></div>`;
  const bindFresh = (root, id, onSet) => {
    const r = root.querySelector('#' + id);
    const set = () => { root.querySelector('#' + id + '-w').classList.remove('empty'); root.querySelector('#' + id + '-o').textContent = r.value + '%'; r.dataset.set = '1'; onSet && onSet(+r.value); };
    r.addEventListener('input', set); r.addEventListener('change', set); r.addEventListener('pointerup', set);
  };
  const latestLite = () => Store.get().formulations[0];
  const planned = () => Store.get().exp.e4.filter(r => r.status === 'planned');

  /* ---------- 홈 ---------- */
  Views.home = function (el) {
    const d = Store.get();
    const f = d.formulations[0], pl = planned(), done = d.exp.e4.filter(r => r.status === 'done');
    el.innerHTML = `
      <h1>사람들 앞에서 긴장되는 마음, 함께 살펴봐요</h1>
      <p class="say">긴장하는 건 이상한 일이 아니에요. 누구나 그래요. 다만 몇 가지 습관이 긴장을 더 오래 붙잡아 두곤 해요. 몇 가지만 고르면 내 긴장이 어떻게 이어지는지 보이고, 오늘 해 볼 작은 연습을 찾을 수 있어요.</p>
      ${CW.safety.weeklyNote(d.weekly)}
      <ol class="path">
        <li class="${f ? 'done' : ''}"><b>내 패턴 알아보기</b><span>약 3분 · 고르기만 하면 돼요</span><a class="btn ${f ? 'ghost small' : ''}" href="#pattern">${f ? '다시 보기' : '시작하기'}</a></li>
        <li class="${pl.length || done.length ? 'done' : ''}"><b>작은 연습 하나 고르기</b><span>약 2분 · 쉬운 것부터</span><a class="btn ${f && !pl.length ? '' : 'ghost small'}" href="#practice">고르기</a></li>
        <li class="${done.length ? 'done' : ''}"><b>해 보고 나서 기록하기</b><span>1분 · 생각과 실제 비교하기</span><a class="btn ${pl.length ? '' : 'ghost small'}" href="#log">${pl.length ? `기록하기 (${pl.length})` : '기록 보기'}</a></li>
      </ol>
      <div class="ok-box">지금 긴장되나요? <a href="#calm">1분 연습</a>으로 주의를 바깥으로 옮겨 보세요.</div>
      ${done.length ? `<p class="hint">지금까지 해 본 연습 <b style="color:var(--ink)">${done.length}번</b>. 작은 연습이 쌓이면 긴장이 줄어들어요.</p>` : ''}`;
  };

  /* ---------- 내 패턴 ---------- */
  Views.pattern = function (el, sub) {
    let S = loadDraft() || { i: 0, sit: [], fear: [], img: [], sb: [], sy: [] };
    if (sub === 'new') { S = { i: 0, sit: [], fear: [], img: [], sb: [], sy: [] }; saveDraft(S); }
    const f = latestLite();
    if (sub !== 'new' && !loadDraft() && f && f.source === 'light') return showPattern(el, f);
    const render = () => {
      const st = STEPS[S.i], sel = S[st.key];
      el.innerHTML = `
        <div class="bar-steps">${STEPS.map((_, i) => `<i class="${i <= S.i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="prog">${S.i + 1} / ${STEPS.length}</div>
        <h1 style="font-size:26px">${st.q}</h1>
        ${st.hint ? `<p class="hint">${st.hint}</p>` : ''}
        <div class="chips">${st.items.map(it => chip(it.id, it.label, sel.includes(it.id))).join('')}</div>
        <div class="btns split"><button class="btn ghost" id="back" type="button">${S.i ? '이전' : '처음으로'}</button>
          <button class="btn" id="next" type="button" ${sel.length ? '' : 'disabled'}>${S.i === STEPS.length - 1 ? '내 패턴 보기' : '다음'}</button></div>
        ${st.key !== 'sit' ? '<p class="hint" style="text-align:right">해당하는 게 없으면 <button class="linkish" id="skip" type="button">건너뛰기</button></p>' : ''}`;
      el.querySelectorAll('.chip').forEach(b => b.onclick = () => {
        const id = b.dataset.id;
        if (st.single) S[st.key] = [id];
        else if (id === 'none') S[st.key] = S[st.key].includes('none') ? [] : ['none'];
        else { S[st.key] = S[st.key].filter(x => x !== 'none'); const a = S[st.key]; a.includes(id) ? a.splice(a.indexOf(id), 1) : a.push(id); }
        saveDraft(S); render();
      });
      el.querySelector('#back').onclick = () => { if (S.i) { S.i--; saveDraft(S); render(); } else location.hash = '#home'; };
      const fwd = () => { if (S.i < STEPS.length - 1) { S.i++; saveDraft(S); render(); window.scrollTo(0, 0); } else finish(); };
      el.querySelector('#next').onclick = fwd;
      const sk = el.querySelector('#skip'); if (sk) sk.onclick = () => { S[st.key] = []; fwd(); };
    };
    const finish = () => {
      const imgs = S.img.filter(x => x !== 'none');
      const rec = {
        id: uid(), date: new Date().toISOString(), source: 'light',
        situation: lbl(SITS, S.sit[0]), anxiety: null,
        thought: S.fear.map(x => lbl(FEARS, x)).join(', ') || '사람들이 나를 부정적으로 볼까 봐',
        fears: S.fear, beliefs: [], pov: imgs.length ? 'observer' : 'none',
        image: imgs.map(x => lbl(IMAGES, x)).join(', '), imageBelief: null,
        safety: S.sb, safetyOther: '', symptoms: S.sy, symptomsOther: '', pre: '', post: '',
      };
      Store.save(d => d.formulations.unshift(rec));
      clearDraft();
      showPattern(el, rec);
    };
    render();
  };

  function showPattern(el, r) {
    window.scrollTo(0, 0);
    const sb = C.safetyList.filter(s => r.safety.includes(s.id)).map(s => s.label);
    const sy = C.symptomList.filter(s => r.symptoms.includes(s.id)).map(s => s.label);
    const box = (k, t, cls = '') => `<div class="fbox ${cls}"><div class="k">${k}</div><div class="t">${t ? esc(t) : '<span class="muted">고르지 않음</span>'}</div></div>`;
    const ins = [];
    if (r.pov === 'observer') ins.push('긴장한 순간 떠오른 내 모습은 실제로 본 게 아니라 <b>긴장한 느낌으로 그린 그림</b>이에요. 실제로 남들 눈에는 훨씬 덜 보이는 경우가 많아요.');
    if (r.safety.includes('cover')) ins.push('손이나 몸에 힘을 주면 <b>떨림이 오히려 커질 수 있어요.</b> 숨기려는 노력이 증상을 키우는 거예요.');
    if (r.safety.some(x => ['script', 'monitor', 'rehearse'].includes(x))) ins.push('할 말을 준비하고 점검하는 동안엔 <b>상대의 말이 잘 안 들려요.</b> 그래서 대화가 더 어색하게 느껴질 수 있어요.');
    if (r.safety.some(x => ['eye', 'quiet', 'phone'].includes(x))) ins.push('눈을 피하거나 말을 줄이면 상대는 나를 <b>관심 없는 사람</b>으로 오해할 수 있어요. 그러면 상대도 거리를 두고, "역시 날 싫어해"라고 느끼게 돼요.');
    if (r.safety.length) ins.push('아무 일도 없었다면 "이 행동 덕분이야"라고 생각했을 수 있어요. 그래서 <b>걱정이 맞는지 확인할 기회</b>를 놓치게 돼요.');
    el.innerHTML = `
      <div class="prog">내 패턴 · ${fmtDate(r.date)}</div>
      <h1 style="font-size:26px">내 긴장은 이렇게 이어지고 있어요</h1>
      <p class="hint">이건 성격 탓이 아니에요. 누구에게나 생길 수 있는, 서로를 키우는 고리예요.</p>
      <div class="formu">
        ${box('이런 순간에', r.situation)}
        <div class="arr">↓</div>
        ${box('이런 걱정이 들고', r.thought, 'core')}
        <div class="arr">↓</div>
        ${box('내 모습이 이렇게 보일 것 같아서', r.image, 'self')}
        <div class="frow">${box('이런 행동을 하고', sb.join('\n'))}${box('몸은 이랬어요', sy.join('\n'))}</div>
        <div class="loopnote">행동과 몸의 반응이 다시 "역시 티가 나"라는 느낌을 키워요</div>
      </div>
      ${ins.length ? `<h2>알아 두면 좋은 것</h2><ul class="ins">${ins.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
      <div class="ok-box">이 고리는 <b>행동</b>에서 끊어 보기 가장 쉬워요. 작은 행동 하나를 바꿔 보고, 걱정한 일이 정말 일어나는지 확인해 봐요.</div>
      <div class="btns"><a class="btn" href="#practice">작은 연습 고르기</a><a class="btn ghost" href="#pattern/new">다른 장면으로 다시 하기</a></div>`;
  }

  /* ---------- 연습 고르기 ---------- */
  Views.practice = function (el, sub) {
    const f = latestLite();
    const mine = f ? f.safety : [];
    if (sub) { const p = PRACTICES.find(x => x.id === sub); if (p) return plan(el, p, f); }
    const card = p => `<a class="chip" href="#practice/${p.id}" style="text-decoration:none"><span>${esc(p.text)}${p.drop && mine.includes(p.drop) ? '<span class="match">내 패턴에 맞춤</span>' : ''}<span class="sub">걱정: ${esc(p.pred)}</span></span></a>`;
    el.innerHTML = `
      <h1 style="font-size:26px">어떤 연습을 해 볼까요?</h1>
      <p class="hint">${f ? '내 패턴에 맞는 연습에 표시해 두었어요. ' : ''}가벼운 것부터 시작해도 충분해요. 연습 중에 긴장되는 건 자연스러운 일이에요.</p>
      ${!f ? '<div class="ok-box">먼저 <a href="#pattern">내 패턴 알아보기</a>를 하면 나에게 맞는 연습을 골라 드려요.</div>' : ''}
      ${[1, 2, 3].map(lv => `<div class="level">${LV[lv]}</div><div class="chips one">${PRACTICES.filter(p => p.lv === lv).sort((a, b) => (mine.includes(b.drop) ? 1 : 0) - (mine.includes(a.drop) ? 1 : 0)).map(card).join('')}</div>`).join('')}`;
  };

  function plan(el, p, f) {
    window.scrollTo(0, 0);
    const preds = [p.pred, ...(f && f.fears ? f.fears.map(x => lbl(FEARS, x).replace(/까 봐$/, ' 것 같다')) : [])].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 4);
    const S = { when: 'today', pred: preds[0], belief: null };
    el.innerHTML = `
      <a href="#practice" class="small">← 다른 연습 보기</a>
      <h1 style="font-size:26px;margin-top:12px">${esc(p.text)}</h1>
      <h3>언제 해 볼까요?</h3>
      <div class="chips" id="when">${WHEN.map(w => chip(w.id, w.label, S.when === w.id)).join('')}</div>
      <h3>어떤 일이 생길 것 같나요?</h3>
      <div class="chips one" id="pred">${preds.map((t, i) => chip(String(i), t, i === 0)).join('')}</div>
      ${freshSlider('bel', '그 걱정이 실제로 일어날 것 같은 정도', ['전혀 아닐 것 같다', '분명 그럴 것 같다'])}
      <p class="hint" id="belhint">막대를 움직여 표시해 주세요. 나중에 실제 결과와 비교해 볼 거예요.</p>
      <div class="ok-box"><b>하는 동안 한 가지만</b> · 내가 어떻게 보일지 대신, 상대의 표정이나 주변에 주의를 두세요.</div>
      <div class="btns"><button class="btn" id="save" type="button" disabled>이 연습 약속하기</button></div>`;
    const pick = (box, key, map) => el.querySelectorAll(`#${box} .chip`).forEach(b => b.onclick = () => {
      el.querySelectorAll(`#${box} .chip`).forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); S[key] = map(b.dataset.id);
    });
    pick('when', 'when', id => id);
    pick('pred', 'pred', id => preds[+id]);
    bindFresh(el, 'bel', v => { S.belief = v; el.querySelector('#save').disabled = false; el.querySelector('#belhint').textContent = ''; });
    el.querySelector('#save').onclick = () => {
      const d0 = new Date(); if (S.when === 'tomorrow') d0.setDate(d0.getDate() + 1);
      const rec = {
        id: uid(), date: new Date().toISOString(), status: 'planned', source: 'light',
        situation: p.text, type: p.lv === 3 ? 'do' : 'drop', pred: S.pred, how: '', before: S.belief,
        drop: p.drop ? [p.drop] : [], attention: '상대의 표정이나 주변에 주의 두기',
        when: null, whenLabel: lbl(WHEN, S.when), practice: p.id,
      };
      Store.save(d => d.exp.e4.unshift(rec));
      promised(el, rec);
    };
  }

  function promised(el, r) {
    window.scrollTo(0, 0);
    history.replaceState(null, '', '#practice');
    el.innerHTML = `
      <h1 style="font-size:26px">좋아요, 약속했어요</h1>
      <p class="say"><b>${esc(r.whenLabel)}</b> · ${esc(r.situation)}</p>
      <p class="hint">해 보고 나서 이 페이지에 돌아와 어땠는지 1분만 기록해 주세요. 걱정과 실제를 비교하는 게 이 연습의 핵심이에요.</p>
      <h2>잊지 않으려면</h2>
      <div class="remind">
        <div><label class="f" for="rd">알림 날짜</label><input type="date" id="rd" value="${(() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })()}"></div>
        <div><label class="f" for="rt">시간</label><input type="time" id="rt" value="18:00"></div>
      </div>
      <div class="btns"><button class="btn ghost" id="ics" type="button">캘린더에 알림 추가</button><button class="btn ghost" id="pact" type="button">믿을 만한 사람에게 알리기</button></div>
      <p class="hint" id="msg" role="status"></p>
      <div class="btns"><a class="btn" href="#home">처음으로</a></div>`;
    el.querySelector('#ics').onclick = () => {
      const start = new Date(`${el.querySelector('#rd').value}T${el.querySelector('#rt').value || '18:00'}`);
      CWShare.download('practice.ics', CWShare.buildICS([{ uid: 'lite-' + r.id, start, durationMin: 15, alarmMin: 0, title: `작은 연습: ${r.situation}`, desc: `걱정: ${r.pred}\n하는 동안: 상대의 표정이나 주변에 주의 두기\n해 보고 나서 기록하기: ${location.href.split('#')[0]}#log` }]), 'text/calendar');
      el.querySelector('#msg').textContent = '파일을 열면 캘린더에 추가돼요.';
    };
    el.querySelector('#pact').onclick = async () => {
      const text = `${r.whenLabel} 작은 연습을 하나 해 보려고 해. 끝나고 어땠는지 한번 물어봐 줄래?`;
      const m = await CWShare.shareOrCopy(text, '연습 약속');
      el.querySelector('#msg').textContent = m ? `${m} · "${text}"` : `직접 복사해 주세요: "${text}"`;
    };
  }

  /* ---------- 기록 ---------- */
  const OUTS = [
    { id: 0, label: '걱정한 일은 일어나지 않았어요' },
    { id: 1, label: '조금 비슷한 일이 있었어요' },
    { id: 2, label: '걱정한 그대로였어요' },
  ];
  const FEED = [
    '걱정은 실제보다 훨씬 컸네요. 이걸 직접 확인하는 게 바로 이 연습의 목적이에요.',
    '조금 있었지만, 생각만큼 큰일은 아니었죠? 같은 연습을 한 번 더 하면 더 편해질 거예요.',
    '그래도 해 낸 것 자체가 중요한 한 걸음이에요. 상대가 실제로 어떻게 반응했는지 떠올려 보고, 한 단계 쉬운 연습으로 다시 해 봐요.',
  ];
  Views.log = function (el, sub) {
    const d = Store.get();
    const pl = d.exp.e4.filter(r => r.status === 'planned');
    const done = d.exp.e4.filter(r => r.status === 'done');
    if (sub) { const r = pl.find(x => x.id === sub); if (r) return record(el, r); }
    el.innerHTML = `
      <h1 style="font-size:26px">해 본 연습 기록하기</h1>
      ${pl.length ? `<p class="hint">해 본 연습을 골라 주세요.</p><div class="chips one">${pl.map(r => `<a class="chip" href="#log/${r.id}" style="text-decoration:none"><span>${esc(r.situation)}<span class="sub">${esc(r.whenLabel || fmtDate(r.date))} · 걱정: ${esc(r.pred)}</span></span></a>`).join('')}</div>`
        : `<p class="hint">기록할 연습이 없어요. <a href="#practice">작은 연습 고르기</a>부터 해 보세요.</p>`}
      ${done.length ? `<h2>지금까지 ${done.length}번 해 봤어요</h2><div class="list">${done.map(r => `<div class="rec"><div class="meta">${fmtDate(r.doneDate || r.date)}</div>
        <div class="body">${esc(r.situation)}</div>
        ${chart.bars([{ label: '해 보기 전 걱정', value: r.before, max: 100, text: r.before + '%', cls: 'high' }, { label: '해 본 뒤', value: r.after, max: 100, text: r.after + '%' }])}
        ${r.learn ? `<blockquote>${esc(r.learn)}</blockquote>` : ''}</div>`).join('')}</div>` : ''}`;
  };

  function record(el, r) {
    window.scrollTo(0, 0);
    const S = { out: null, after: null };
    el.innerHTML = `
      <a href="#log" class="small">← 기록</a>
      <h1 style="font-size:26px;margin-top:12px">어땠어요?</h1>
      <p class="hint">${esc(r.situation)}<br>해 보기 전 걱정: "${esc(r.pred)}" (${r.before}%)</p>
      <div class="chips one" id="out">${OUTS.map(o => chip(String(o.id), o.label, false)).join('')}</div>
      <div id="rest" hidden>
        ${freshSlider('aft', '지금은 그 걱정이 얼마나 맞을 것 같나요?', ['전혀 아닐 것 같다', '분명 그럴 것 같다'])}
        <label class="f" for="note">한 줄 메모 <span class="muted small">(선택)</span></label>
        <input type="text" id="note" maxlength="200" placeholder="예: 점원은 그냥 웃으면서 인사했다">
        <div class="btns"><button class="btn" id="save" type="button" disabled>기록하기</button></div>
      </div>`;
    el.querySelectorAll('#out .chip').forEach(b => b.onclick = () => {
      el.querySelectorAll('#out .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); S.out = +b.dataset.id; el.querySelector('#rest').hidden = false;
    });
    bindFresh(el, 'aft', v => { S.after = v; el.querySelector('#save').disabled = false; });
    el.querySelector('#save').onclick = () => {
      history.replaceState(null, '', '#log');
      Store.save(d => Object.assign(d.exp.e4.find(x => x.id === r.id), { status: 'done', outcome: S.out, after: S.after, what: OUTS[S.out].label, others: '', learn: ui.val(el, 'note'), doneDate: new Date().toISOString() }));
      el.innerHTML = `
        <h1 style="font-size:26px">기록했어요</h1>
        <p class="say">${FEED[S.out]}</p>
        ${chart.bars([{ label: '해 보기 전 걱정', value: r.before, max: 100, text: r.before + '%', cls: 'high' }, { label: '해 본 뒤', value: S.after, max: 100, text: S.after + '%' }])}
        <div class="btns"><a class="btn" href="#practice">다음 연습 고르기</a><a class="btn ghost" href="#home">처음으로</a></div>`;
      window.scrollTo(0, 0);
    };
  }

  /* ---------- 1분 연습 ---------- */
  Views.calm = function (el) {
    const cues = ['지금 들리는 소리 3가지를 찾아보세요', '눈에 보이는 색깔 3가지를 찾아보세요', '앞에 있는 사람이나 물건 하나를 자세히 보세요'];
    el.innerHTML = `
      <h1 style="font-size:26px">1분 연습: 주의를 바깥으로</h1>
      <p class="hint">긴장하면 주의가 나에게로 쏠려요. 바깥으로 옮기면 긴장의 고리가 느슨해져요. 20초씩 세 가지를 안내할게요.</p>
      <div class="cue" id="cue">준비되면 시작을 눌러 주세요</div>
      <div class="timer" id="t">1:00</div>
      <div class="btns" style="justify-content:center"><button class="btn" id="go" type="button">시작</button></div>`;
    let left = 60, id = null;
    CW.onLeave(() => clearInterval(id));
    const t = el.querySelector('#t'), cue = el.querySelector('#cue'), go = el.querySelector('#go');
    go.onclick = () => {
      if (id) return;
      go.hidden = true; cue.textContent = cues[0];
      id = setInterval(() => {
        left--; t.textContent = `0:${String(left).padStart(2, '0')}`;
        cue.textContent = cues[Math.min(2, Math.floor((60 - left) / 20))];
        if (left <= 0) {
          clearInterval(id); id = null;
          cue.textContent = '잘했어요. 지금 주의는 어디에 있나요?';
          go.hidden = false; go.textContent = '한 번 더'; left = 60; t.textContent = '1:00';
        }
      }, 1000);
    };
  };

  window.addEventListener('hashchange', CW.route);
  CW.route();
})();
