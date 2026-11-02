/* 실험실: CT-SAD 핵심 기법 E1~E6 */
(function () {
  const { Views, Store, esc, uid, fmtDate, ui, chart, onLeave } = CW;
  const C = CONTENT;

  /* 단계 사이에 살아남는 타이머/미디어 정리 */
  let live = [];
  const stopLive = () => { live.forEach(fn => { try { fn(); } catch (e) {} }); live = []; };

  const META = {
    e1: { t: '자기초점·안전행동 비교 실험', d: '같은 과제를 두 조건으로 해 보고 불안과 "보였을 모습"을 비교', m: '약 15분' },
    e2: { t: '비디오 피드백', d: '구체적으로 예측한 뒤, 관찰자 시점으로 내 영상을 보고 비교', m: '약 20분' },
    e3: { t: '외부 주의 훈련', d: '주의를 안에서 밖으로 옮기는 단계별 연습', m: '약 6분' },
    e4: { t: '행동실험 기록지', d: '실제 상황에서 두려운 예측을 검증하는 표준 양식', m: '계획 5분' },
    e5: { t: '설문 조사', d: '다른 사람들이 홍조·떨림을 실제로 어떻게 보는지 물어보기', m: '며칠' },
    e6: { t: '사후 곱씹기 점검', d: '곱씹기가 실제로 남기는 것을 점검하고 그만두는 계획', m: '약 7분' },
  };

  Views.lab = function (el, sub) {
    stopLive();
    onLeave(stopLive);
    const fn = { e1, e2, e3, e4, e5, e6 }[sub];
    if (fn) return fn(el);
    hub(el);
  };

  function head(id, extra = '') {
    return `<a href="#lab" class="small">← 실험실</a>
      <div class="eyebrow" style="margin-top:14px">실험 ${id.toUpperCase()} · ${META[id].m}</div>
      <h1>${META[id].t}</h1>${extra}`;
  }

  function hub(el) {
    const d = Store.get();
    el.innerHTML = `
      <div class="eyebrow">실험실</div>
      <h1>예측을 실험으로 확인하기</h1>
      <p class="lead">CT-SAD의 중심은 말로 설득하는 것이 아니라 직접 확인하는 것입니다. 두려운 예측을 구체적으로 세우고, 유지 고리의 한 지점을 바꾼 뒤, 실제로 무슨 일이 일어나는지 봅니다.</p>
      <div class="note"><b>권장 순서</b> · 사례개념화(자기평가 C) → E1 → E2 → E3 → E4를 반복하면서 E5·E6을 필요할 때 사용합니다. 치료에서도 E1과 E2는 초기 회기에, E4는 이후 매주 진행합니다.</div>
      <div class="grid2">${Object.entries(META).map(([k, m]) => `<a class="tilecard" href="#lab/${k}"><span class="tag">${k.toUpperCase()} · ${m.m}</span><h3>${m.t}</h3><p>${m.d}</p>
        ${d.exp[k].length ? `<p style="margin-top:8px"><span class="pill ok">기록 ${d.exp[k].length}개</span></p>` : ''}</a>`).join('')}</div>
      <div class="note warn" style="margin-top:22px"><b>안전하게 실험하기</b> · 감당할 수 있는 난이도부터 시작하세요. 실험 중 불안이 오르는 것은 정상이며 대개 시간이 지나면 가라앉습니다. 다만 공황이 반복되거나 너무 힘들다면 멈추고 전문가와 함께 진행하세요.</div>`;
  }

  /* 공용: 타이머 */
  function timer(box, seconds, onDone) {
    let left = seconds, id = null;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    box.innerHTML = `<div class="timer" aria-live="off">${fmt(left)}</div>
      <div class="btns" style="justify-content:center;margin-top:6px"><button class="btn" type="button" data-t="go">시작</button><button class="btn ghost" type="button" data-t="done">끝내기</button></div>`;
    const disp = box.querySelector('.timer'), go = box.querySelector('[data-t=go]');
    const stop = () => { clearInterval(id); id = null; };
    live.push(stop);
    go.addEventListener('click', () => {
      if (id) { stop(); go.textContent = '계속'; return; }
      go.textContent = '일시정지';
      id = setInterval(() => {
        left--; disp.textContent = fmt(Math.max(left, 0));
        if (left <= 0) { stop(); onDone(); }
      }, 1000);
    });
    box.querySelector('[data-t=done]').addEventListener('click', () => { stop(); onDone(); });
  }

  const latestFormu = () => Store.get().formulations[0];
  const RATE4 = [
    ['anx', '불안은 얼마나 강했나요?', ['전혀', '극도로']],
    ['self', '주의가 얼마나 나 자신에게 쏠려 있었나요?', ['전혀', '온통 나에게']],
    ['look', '남들 눈에 내가 얼마나 불안해 보였을까요?', ['전혀', '극도로']],
    ['perf', '얼마나 잘 해냈다고 느끼나요?', ['아주 못함', '아주 잘함']],
  ];
  const readRates = (root, defs, pfx) => Object.fromEntries(defs.map(([k]) => [k, ui.num(root, pfx + k)]));

  /* ---------- E1 ---------- */
  function e1(el) {
    const f = latestFormu();
    const S = { step: 0, task: 'solo', topic: 0, sb: f ? f.safety.slice() : [], pred: '', predB: 70, A: null, B: null };
    const topics = ['1분 자기소개: 이름, 하는 일, 요즘 관심사', '최근 본 영화나 책을 친구에게 추천하기', '이번 주말 계획과 그 이유 설명하기', '내가 사는 동네를 처음 온 사람에게 소개하기'];
    const steps = ['준비', '조건 A', 'A 평정', '조건 B', 'B 평정', '결과'];
    const render = () => {
      stopLive();
      const sbLabels = C.safetyList.filter(s => S.sb.includes(s.id));
      const topicLine = S.task === 'solo' ? `<div class="cue" style="font-size:17px">과제: ${esc(topics[S.topic])}<br><span class="small">녹음기나 휴대폰 카메라를 켜 두고, 누군가에게 말하듯 소리 내어 하세요.</span></div>` : `<div class="cue" style="font-size:17px">상대와 3분 정도 평소처럼 대화하세요.<br><span class="small">상대에게는 "대화 연습을 도와 달라"고만 말해도 충분합니다.</span></div>`;
      let body = '';
      if (S.step === 0) body = `
        <p>CT-SAD 초기 회기에 하는 실험입니다. 같은 과제를 <b>조건 A</b>(평소처럼 안전행동을 하고 나를 점검하기)와 <b>조건 B</b>(안전행동을 내려놓고 바깥에 집중하기)로 각각 해 본 뒤 비교합니다. 많은 사람이 예상과 달리 조건 B에서 덜 불안하고 더 자연스러워 보였다고 보고합니다. 직접 확인해 보세요.</p>
        <div class="card"><h3>1. 과제</h3>
          ${ui.likert('task', S.task === 'solo' ? 0 : 1, ['혼자 소리 내어 말하기', '실제 상대와 대화하기'], false)}
          <div id="topicwrap" ${S.task === 'solo' ? '' : 'hidden'}><label class="f" for="topic">말하기 주제</label>
          <select id="topic">${topics.map((t, i) => `<option value="${i}" ${i === S.topic ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div></div>
        <div class="card"><h3>2. 조건 A에서 사용할 안전행동</h3><p class="small muted">${f ? '최근 사례개념화에서 고른 행동이 미리 선택되어 있어요.' : '평소 하는 행동을 골라 주세요.'}</p>
          ${ui.checks('sb', C.safetyList, S.sb)}</div>
        <div class="card"><h3>3. 예측</h3>
          <label class="f" for="pred">안전행동을 내려놓으면(조건 B) 어떤 일이 일어날 것 같나요?<small>예: "더 떨리고, 말이 막히고, 이상해 보일 것이다"</small></label>
          <textarea id="pred" maxlength="300">${esc(S.pred)}</textarea>
          ${ui.slider('predB', '이 예측을 얼마나 믿나요?', S.predB, ['전혀', '완전히'])}</div>
        <div class="btns"><button class="btn" id="next" type="button">조건 A 시작</button></div>`;
      if (S.step === 1) body = `
        <div class="card"><h3>조건 A · 안전행동 + 자기초점</h3>
          <p>3분 동안 아래 안전행동을 <b>평소보다 오히려 더 의식적으로</b> 하세요. 그리고 내가 어떻게 보이는지, 목소리가 어떤지 계속 점검하세요.</p>
          ${sbLabels.length ? `<ul class="tight">${sbLabels.map(s => `<li>${esc(s.label)}</li>`).join('')}</ul>` : '<p class="muted">선택한 안전행동이 없어요. 평소 하는 행동을 떠올리며 하세요.</p>'}
          ${topicLine}<div id="tm"></div></div>`;
      if (S.step === 2 || S.step === 4) body = `
        <div class="card"><h3>${S.step === 2 ? '조건 A' : '조건 B'} 직후 평정</h3><p class="small muted">방금 3분을 떠올리며 답해 주세요.</p>
          ${RATE4.map(([k, l, e]) => ui.slider('r' + k, l, 50, e)).join('')}</div>
        <div class="btns"><button class="btn" id="next" type="button">${S.step === 2 ? '조건 B로' : '결과 보기'}</button></div>`;
      if (S.step === 3) body = `
        <div class="card"><h3>조건 B · 안전행동 내려놓기 + 바깥에 집중</h3>
          <p>이번에는 안전행동을 <b>모두 내려놓으세요</b>.</p>
          ${sbLabels.length ? `<ul class="tight">${sbLabels.map(s => `<li>${esc(s.drop)}</li>`).join('')}</ul>` : ''}
          <p>그리고 주의를 바깥에 두세요. 대화라면 상대의 표정과 말의 내용에, 혼자라면 전하려는 내용과 듣는 사람을 상상하는 데 집중하세요. 내가 어떻게 보이는지는 점검하지 않습니다.</p>
          ${topicLine}<div id="tm"></div></div>`;
      if (S.step === 5) {
        const rows = RATE4.map(([k, l]) => ({ label: l.replace(/[?]/, ''), a: S.A[k], b: S.B[k] }));
        const dAnx = S.A.anx - S.B.anx, dLook = S.A.look - S.B.look;
        body = `
          <div class="card"><h3>조건 A와 B 비교</h3>${chart.compare(rows, ['조건 A · 안전행동+자기초점', '조건 B · 내려놓기+바깥 집중'])}
            <p>${dAnx > 0 || dLook > 0 ? `조건 B에서 ${dAnx > 0 ? `불안이 ${dAnx}점` : ''}${dAnx > 0 && dLook > 0 ? ', ' : ''}${dLook > 0 ? `"보였을 불안"이 ${dLook}점` : ''} 낮았습니다. 안전행동이 불안을 막아 주기보다 <b>오히려 유지시킬 수 있다</b>는 신호입니다.` : '이번에는 조건 B가 더 편하지 않았습니다. 처음 안전행동을 내려놓을 때는 낯설어서 불안이 오를 수 있고, 이것도 흔한 일입니다. 다른 날 다시 해 보거나 E2로 실제 모습을 확인해 보세요.'}</p></div>
          <div class="card">
            ${S.pred ? `<p class="small muted">실험 전 예측 (${S.predB}%)</p><blockquote>${esc(S.pred)}</blockquote>` : ''}
            ${ui.slider('predA', '지금은 그 예측을 얼마나 믿나요?', S.predB, ['전혀', '완전히'])}
            <label class="f" for="learn">이 실험에서 알게 된 것<small>예: "손에 힘을 빼니 오히려 덜 떨렸다. 상대 말에 집중하니 대화가 이어졌다."</small></label>
            <textarea id="learn" maxlength="500"></textarea></div>
          <div class="btns"><button class="btn" id="save" type="button">기록 저장</button></div>`;
      }
      el.innerHTML = head('e1') + ui.steps(steps, S.step) + body;
      ui.bindSliders(el);
      const $ = s => el.querySelector(s);
      if (S.step === 0) {
        el.querySelectorAll('input[name=task]').forEach(r => r.addEventListener('change', () => { S.task = r.value === '0' ? 'solo' : 'partner'; $('#topicwrap').hidden = S.task !== 'solo'; }));
        $('#next').onclick = () => { S.topic = +($('#topic')?.value || 0); S.sb = ui.checkedVals(el, 'sb'); S.pred = ui.val(el, 'pred'); S.predB = ui.num(el, 'predB'); S.step = 1; render(); };
      }
      if (S.step === 1 || S.step === 3) timer($('#tm'), 180, () => { S.step++; render(); });
      if (S.step === 2) $('#next').onclick = () => { S.A = readRates(el, RATE4, 'r'); S.step = 3; render(); };
      if (S.step === 4) $('#next').onclick = () => { S.B = readRates(el, RATE4, 'r'); S.step = 5; render(); };
      if (S.step === 5) $('#save').onclick = () => {
        Store.save(d => d.exp.e1.unshift({ id: uid(), date: new Date().toISOString(), task: S.task, topic: S.task === 'solo' ? topics[S.topic] : '상대와 대화', safety: S.sb, pred: S.pred, before: S.predB, after: ui.num(el, 'predA'), A: S.A, B: S.B, learn: ui.val(el, 'learn') }));
        location.hash = '#track';
      };
      window.scrollTo(0, 0);
    };
    render();
  }

  /* ---------- E2 ---------- */
  const RATE_V = [
    ['anx', '전반적으로 얼마나 불안해 보이나요?'],
    ['tremble', '떨림(손·목소리)이 얼마나 눈에 띄나요?'],
    ['blush', '얼굴이 얼마나 붉어 보이나요?'],
    ['pause', '말 막힘이나 어색한 침묵이 얼마나 눈에 띄나요?'],
    ['odd', '처음 보는 사람이 보기에 얼마나 이상하게 보일까요?'],
  ];
  function e2(el) {
    const S = { step: 0, url: null, pred: null, img: '', moment: '', obs: null };
    const canCam = !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    const steps = ['안내', '녹화', '예측', '관찰', '비교'];
    live.push(() => { if (S.url) URL.revokeObjectURL(S.url); });
    const render = () => {
      let body = '';
      if (S.step === 0) body = `
        <p>비디오 피드백은 CT-SAD에서 효과가 큰 기법입니다. 사회불안이 있는 사람은 불안한 <b>느낌</b>을 근거로 자기 모습을 상상하는데, 그 이미지는 실제보다 훨씬 나쁜 경우가 많습니다. 녹화된 실제 모습과 비교하면 그 차이가 드러납니다.</p>
        <p>효과를 보려면 순서가 중요합니다.</p>
        <ol class="tight"><li>말하는 모습을 2~3분 녹화합니다.</li><li>영상을 보기 <b>전에</b>, 어떻게 보일지 구체적인 숫자로 예측합니다.</li><li>낯선 사람의 영상을 보듯 관찰자 시점으로 봅니다.</li><li>본 대로 다시 평정하고 예측과 비교합니다.</li></ol>
        <div class="note"><b>개인정보</b> · 영상은 이 브라우저의 메모리에만 있고 어디에도 저장되거나 전송되지 않습니다. 이 화면을 떠나면 사라집니다.</div>
        ${canCam ? '' : '<div class="note warn"><b>카메라를 쓸 수 없는 환경이에요.</b> 브라우저 보안 정책상 카메라는 https 주소나 localhost에서만 켤 수 있습니다. 대신 휴대폰 등으로 미리 녹화한 영상 파일을 불러와서 진행할 수 있습니다.</div>'}
        <div class="btns"><button class="btn" id="next" type="button">시작</button></div>`;
      if (S.step === 1) body = `
        <div class="card"><h3>녹화하기</h3>
          <p>아래 주제로 2~3분 동안 카메라를 보며 말해 주세요. 평소처럼 하면 됩니다. 일부러 잘하려고 애쓰지 않아도 됩니다.</p>
          <div class="cue" style="font-size:17px">최근에 있었던 일 하나를 친구에게 이야기하듯 들려주기</div>
          ${canCam ? `<video id="pv" playsinline muted></video>
          <p id="recst" class="small muted" style="text-align:center;margin-top:8px">카메라를 켜면 미리보기가 나타납니다. 최대 3분 녹화됩니다.</p>
          <div class="btns" style="justify-content:center"><button class="btn ghost" id="cam" type="button">카메라 켜기</button><button class="btn" id="rec" type="button" disabled>녹화 시작</button></div>` : ''}
          <label class="f" for="file">${canCam ? '또는 ' : ''}녹화한 영상 파일 불러오기</label>
          <input type="file" id="file" accept="video/*"></div>`;
      if (S.step === 2) body = `
        <div class="card"><h3>영상을 보기 전에, 예측하기</h3>
          <p>녹화하는 동안의 느낌을 떠올려 주세요. 영상 속 내가 남들 눈에 어떻게 보일까요?</p>
          <label class="f" for="img">머릿속에 떠오르는 내 모습을 묘사해 주세요<small>예: "얼굴이 새빨갛고, 눈동자가 계속 흔들리고, 목소리가 덜덜 떨린다"</small></label>
          <textarea id="img" maxlength="400">${esc(S.img)}</textarea>
          <label class="f" for="moment">가장 이상해 보일 것 같은 순간은?<small>예: "중간에 말이 막혔을 때"</small></label>
          <input type="text" id="moment" maxlength="200" value="${esc(S.moment)}">
          ${RATE_V.map(([k, l]) => ui.slider('p' + k, l, 60, ['전혀', '극도로'])).join('')}</div>
        <div class="btns"><button class="btn" id="next" type="button">예측 완료, 영상 보기</button></div>`;
      if (S.step === 3) body = `
        <div class="card"><h3>관찰자로서 보기</h3>
          <ul class="tight"><li>이 사람을 <b>처음 보는 사람</b>이라고 생각하세요.</li><li>녹화할 때의 느낌은 떠올리지 마세요. <b>화면에 보이고 들리는 것만</b> 판단합니다.</li><li>"${esc(S.moment || '가장 이상해 보일 것 같았던 순간')}"이 오면, 실제로 어떻게 보이는지 확인하세요.</li></ul>
          <video id="pb" controls playsinline src="${S.url}"></video></div>
        <div class="card"><h3>본 대로 평정하기</h3>
          ${RATE_V.map(([k, l]) => ui.slider('o' + k, l, 30, ['전혀', '극도로'])).join('')}</div>
        <div class="btns"><button class="btn" id="next" type="button">예측과 비교</button></div>`;
      if (S.step === 4) {
        const rows = RATE_V.map(([k, l]) => ({ label: l.replace(/[?]/, ''), a: S.pred[k], b: S.obs[k] }));
        const gap = Math.round(RATE_V.reduce((s, [k]) => s + (S.pred[k] - S.obs[k]), 0) / RATE_V.length);
        body = `
          <div class="card"><h3>예측과 실제 관찰</h3>${chart.compare(rows, ['예측 (느낌으로 본 나)', '관찰 (영상 속 나)'])}
            <p>${gap > 0 ? `평균적으로 예측이 관찰보다 <b>${gap}점 높았습니다</b>. 느낌으로 만든 자기 이미지가 실제 모습보다 나빴다는 뜻입니다. 다음에 그 이미지가 떠오르면, 이것은 관찰이 아니라 <b>느낌</b>이라는 것을 기억하세요.` : '이번에는 예측과 관찰이 비슷하거나 관찰이 더 높았습니다. 영상을 관찰자 시점으로 보기 어려웠을 수 있습니다. 며칠 뒤 다시 보거나, 믿을 만한 사람에게 같은 항목을 평정해 달라고 해 보세요.'}</p></div>
          ${S.img ? `<div class="card"><p class="small muted">실험 전 떠올린 내 모습</p><blockquote>${esc(S.img)}</blockquote></div>` : ''}
          <div class="card"><label class="f" for="learn" style="margin-top:0">알게 된 것<small>예: "얼굴이 빨개진 게 거의 보이지 않았다. 말이 막힌 순간도 1초 정도로 짧았다."</small></label>
            <textarea id="learn" maxlength="500"></textarea></div>
          <div class="btns"><button class="btn" id="save" type="button">기록 저장 (영상 제외)</button></div>`;
      }
      el.innerHTML = head('e2') + ui.steps(steps, S.step) + body;
      ui.bindSliders(el);
      const $ = s => el.querySelector(s);
      if (S.step === 0) $('#next').onclick = () => { S.step = 1; render(); };
      if (S.step === 1) bindRecord(el, S, () => { S.step = 2; render(); });
      if (S.step === 2) $('#next').onclick = () => { S.img = ui.val(el, 'img'); S.moment = ui.val(el, 'moment'); S.pred = readRates(el, RATE_V, 'p'); S.step = 3; render(); };
      if (S.step === 3) $('#next').onclick = () => { S.obs = readRates(el, RATE_V, 'o'); S.step = 4; render(); };
      if (S.step === 4) $('#save').onclick = () => {
        Store.save(d => d.exp.e2.unshift({ id: uid(), date: new Date().toISOString(), image: S.img, moment: S.moment, pred: S.pred, obs: S.obs, learn: ui.val(el, 'learn') }));
        location.hash = '#track';
      };
      window.scrollTo(0, 0);
    };
    render();
  }

  function bindRecord(el, S, done) {
    const file = el.querySelector('#file');
    file.addEventListener('change', () => {
      if (!file.files[0]) return;
      if (S.url) URL.revokeObjectURL(S.url);
      S.url = URL.createObjectURL(file.files[0]);
      done();
    });
    const camBtn = el.querySelector('#cam');
    if (!camBtn) return;
    const pv = el.querySelector('#pv'), recBtn = el.querySelector('#rec'), st = el.querySelector('#recst');
    let stream = null, rec = null, chunks = [], autoStop = null, tick = null;
    const release = () => { clearTimeout(autoStop); clearInterval(tick); if (rec && rec.state !== 'inactive') rec.stop(); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
    live.push(release);
    camBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        pv.srcObject = stream; await pv.play();
        recBtn.disabled = false; camBtn.disabled = true;
        st.textContent = '준비되면 녹화를 시작하세요.';
      } catch (e) {
        st.textContent = '카메라나 마이크를 켤 수 없어요. 브라우저 주소창의 권한 설정을 확인하거나 영상 파일을 불러와 주세요.';
      }
    });
    recBtn.addEventListener('click', () => {
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      chunks = [];
      rec = new MediaRecorder(stream);
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
        if (S.url) URL.revokeObjectURL(S.url);
        S.url = URL.createObjectURL(blob);
        release(); done();
      };
      rec.start();
      const t0 = Date.now();
      recBtn.textContent = '녹화 끝내기';
      tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); st.innerHTML = `<span class="rec-dot"></span>녹화 중 ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} / 3:00`; }, 500);
      autoStop = setTimeout(() => rec.state === 'recording' && rec.stop(), 180000);
    });
  }

  /* ---------- E3 ---------- */
  function e3(el) {
    const phases = [
      { t: '소리', s: 60, cue: '들리는 소리를 하나씩 찾아 이름을 붙이세요.\n가까운 소리, 먼 소리, 아주 작은 소리까지.' },
      { t: '보이는 것', s: 60, cue: '주변의 물건 하나를 골라 자세히 관찰하세요.\n색, 질감, 모양, 빛이 닿는 부분.' },
      { t: '전환 연습', s: 120, alt: ['안으로: 내 호흡과 몸의 느낌', '밖으로: 보이는 것과 들리는 것'] },
      { t: '사람에게', s: 60, cue: '인터뷰나 대화 영상을 틀고, 말하는 사람의 표정과 말의 요점에 주의를 두세요.\n내가 어떻게 느끼는지는 잠시 내려놓습니다.' },
    ];
    const S = { i: -1 };
    const render = () => {
      stopLive();
      if (S.i === -1) {
        el.innerHTML = head('e3') + `
          <p>불안할 때 주의는 자동으로 안쪽(몸의 느낌, 내 모습)으로 향합니다. 이 연습은 주의를 의도적으로 바깥으로 옮기는 힘을 기릅니다. 목표는 불안을 없애는 것이 아니라, <b>주의가 어디에 있는지 알아차리고 옮길 수 있게</b> 되는 것입니다.</p>
          <div class="card"><h3>구성 · 약 5분</h3><ol class="tight">${phases.map(p => `<li>${p.t} (${p.s / 60}분)</li>`).join('')}</ol></div>
          <div class="btns"><button class="btn" id="go" type="button">연습 시작</button></div>`;
        el.querySelector('#go').onclick = () => { S.i = 0; render(); };
        return;
      }
      if (S.i >= phases.length) {
        el.innerHTML = head('e3') + `
          <div class="card"><h3>연습 후 평정</h3>
            ${ui.slider('easy', '주의를 바깥에 두기가 얼마나 쉬웠나요?', 50, ['아주 어려움', '아주 쉬움'])}
            ${ui.slider('ctrl', '주의를 원하는 곳으로 옮길 수 있었나요?', 50, ['전혀', '완전히'])}</div>
          <div class="card"><h3>실제 대화에서 쓰기</h3><ul class="tight">
            <li>상대의 눈 색깔, 표정 변화, 말의 핵심 단어 하나를 찾아보세요.</li>
            <li>"내가 어떻게 보일까"가 떠오르면 알아차리고, 상대의 말로 주의를 다시 옮기세요.</li>
            <li>매일 짧게라도 반복하면 주의를 옮기는 일이 쉬워집니다.</li></ul></div>
          <div class="btns"><button class="btn" id="save" type="button">기록 저장</button></div>`;
        ui.bindSliders(el);
        el.querySelector('#save').onclick = () => { Store.save(d => d.exp.e3.unshift({ id: uid(), date: new Date().toISOString(), easy: ui.num(el, 'easy'), ctrl: ui.num(el, 'ctrl') })); location.hash = '#track'; };
        return;
      }
      const p = phases[S.i];
      el.innerHTML = head('e3') + ui.steps(phases.map(x => x.t), S.i) + `
        <div class="cue" id="cue" style="white-space:pre-line">${esc(p.cue || p.alt[0])}</div>
        <div id="tm"></div>`;
      if (p.alt) {
        let k = 0;
        const id = setInterval(() => { k = 1 - k; const c = el.querySelector('#cue'); if (c) c.textContent = p.alt[k]; }, 15000);
        live.push(() => clearInterval(id));
      }
      timer(el.querySelector('#tm'), p.s, () => { S.i++; render(); });
    };
    render();
  }

  /* ---------- E4 ---------- */
  function e4(el) {
    stopLive();
    const d = Store.get();
    const list = d.exp.e4;
    const f = d.formulations[0];
    el.innerHTML = head('e4', `<p class="lead">행동실험은 CT-SAD에서 매주 하는 과제입니다. 두려운 예측을 <b>확인할 수 있는 형태</b>로 적고, 실제 상황에서 유지 고리를 바꿔 본 뒤, 무슨 일이 일어났는지 기록합니다.</p>`) + `
      ${list.length ? `<h2>내 실험</h2><div class="list">${list.map(r => e4Card(r)).join('')}</div>` : ''}
      <h2>새 실험 계획</h2>
      <form id="f" class="card" novalidate>
        <label class="f" for="sit" style="margin-top:0">언제, 어디서, 누구와?<small>예: 목요일 점심, 팀원 3명과 식사</small></label>
        <input type="text" id="sit" maxlength="200">
        <label class="f">실험 유형</label>
        ${ui.likert('type', 0, ['안전행동 내려놓기', '두려운 일 일부러 하기', '정보 모으기'], false)}
        <label class="f" for="pred">검증할 예측<small>무슨 일이 일어나고, 사람들이 어떻게 반응할까요? 확인할 수 있게 구체적으로. 예: "내가 먼저 말을 꺼내면 목소리가 떨리고, 사람들이 서로 눈빛을 주고받을 것이다"</small></label>
        <textarea id="pred" maxlength="400">${f ? esc(f.thought) : ''}</textarea>
        <label class="f" for="how">예측이 맞았는지 어떻게 알 수 있을까요?<small>예: "사람들의 표정, 대화가 이어지는지, 누가 떨림을 언급하는지 본다"</small></label>
        <input type="text" id="how" maxlength="200">
        ${ui.slider('belief', '이 예측을 얼마나 믿나요?', 70, ['전혀', '완전히'])}
        <label class="f">이번에 내려놓을 안전행동</label>
        ${ui.checks('drop', C.safetyList.map(s => ({ id: s.id, label: `${s.label} → ${s.drop}` })), f ? f.safety : [])}
        <label class="f" for="att">주의는 어디에 둘까요?</label>
        <input type="text" id="att" maxlength="200" value="상대의 표정과 말의 내용에 집중한다">
        <div class="remind">
          <div><label class="f" for="wdate">날짜 <span class="muted small">(선택)</span></label><input type="date" id="wdate"></div>
          <div><label class="f" for="wtime">시간</label><input type="time" id="wtime"></div>
        </div>
        <p class="small muted">날짜를 정하면 캘린더 알림을 만들 수 있어요. 언제 할지 미리 정해 두면 실제로 해낼 가능성이 높아집니다.</p>
        <p id="miss" class="small muted"></p>
        <div class="btns"><button class="btn" type="submit">실험 계획 저장</button></div>
      </form>`;
    ui.bindSliders(el);
    const form = el.querySelector('#f');
    const draft = ui.autosave(form, 'e4');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!ui.val(form, 'sit') || !ui.val(form, 'pred')) { form.querySelector('#miss').innerHTML = '<b style="color:var(--danger)">상황과 예측을 적어 주세요.</b>'; return; }
      Store.save(d => d.exp.e4.unshift({
        id: uid(), date: new Date().toISOString(), status: 'planned', situation: ui.val(form, 'sit'),
        type: ['drop', 'do', 'info'][ui.radioVal(form, 'type') ?? 0], pred: ui.val(form, 'pred'), how: ui.val(form, 'how'),
        before: ui.num(form, 'belief'), drop: ui.checkedVals(form, 'drop'), attention: ui.val(form, 'att'),
        when: ui.val(form, 'wdate') ? `${ui.val(form, 'wdate')}T${ui.val(form, 'wtime') || '12:00'}` : null,
      }));
      draft.clear();
      e4(el);
    });
    bindE4Cards(el);
  }

  function e4Card(r) {
    const typeT = { drop: '안전행동 내려놓기', do: '두려운 일 일부러 하기', info: '정보 모으기' }[r.type];
    const drops = C.safetyList.filter(s => (r.drop || []).includes(s.id)).map(s => s.drop);
    const outT = ['전혀 일어나지 않음', '일부 일어남', '예측대로 일어남'];
    return `<div class="rec" data-id="${r.id}">
      <div class="meta"><span>${fmtDate(r.date)}</span><span class="pill">${typeT}</span><span class="pill ${r.status === 'done' ? 'ok' : 'warn'}">${r.status === 'done' ? '완료' : '계획'}</span></div>
      <div style="font-weight:500;margin-top:6px">${esc(r.situation)}</div>
      <div class="body"><span class="muted">예측 (${r.before}%)</span> ${esc(r.pred)}</div>
      ${drops.length ? `<div class="body small"><span class="muted">내려놓을 것</span> ${drops.map(esc).join(' · ')}</div>` : ''}
      ${r.attention ? `<div class="body small"><span class="muted">주의</span> ${esc(r.attention)}</div>` : ''}
      ${r.status === 'done' ? `
        <div class="body"><span class="muted">실제로 일어난 일</span> ${esc(r.what)}</div>
        ${r.others ? `<div class="body"><span class="muted">상대 반응</span> ${esc(r.others)}</div>` : ''}
        <div class="body"><span class="muted">예측은</span> ${outT[r.outcome]}</div>
        ${chart.bars([{ label: '실험 전 믿음', value: r.before, max: 100, text: r.before + '%', cls: 'high' }, { label: '실험 후 믿음', value: r.after, max: 100, text: r.after + '%' }])}
        ${r.learn ? `<blockquote>${esc(r.learn)}</blockquote>` : ''}` : `
        ${r.when ? `<div class="body small"><span class="muted">언제</span> ${esc(r.when.replace('T', ' '))}</div>` : ''}
        <div class="btns" style="margin-top:10px"><button class="btn small" data-outcome="${r.id}" type="button">결과 기록하기</button>
          ${r.when ? `<button class="btn small ghost" data-ics="${r.id}" type="button">캘린더에 추가</button>` : ''}
          <button class="btn small ghost" data-pact="${r.id}" type="button">약속 알리기</button></div>
        <p class="small muted" data-pactmsg="${r.id}" role="status"></p>
        <div class="outform" hidden></div>`}
      <div style="text-align:right"><button class="btn small danger" data-del="${r.id}" type="button">삭제</button></div>
    </div>`;
  }

  function bindE4Cards(el) {
    const find = id => Store.get().exp.e4.find(x => x.id === id);
    el.querySelectorAll('[data-ics]').forEach(b => b.addEventListener('click', () => {
      const r = find(b.dataset.ics);
      const drops = C.safetyList.filter(s => (r.drop || []).includes(s.id)).map(s => s.drop);
      CWShare.download('experiment.ics', CWShare.buildICS([{
        uid: 'e4-' + r.id, start: new Date(r.when), durationMin: 30, alarmMin: 30,
        title: `행동실험: ${r.situation}`,
        desc: `예측(${r.before}%): ${r.pred}\n${drops.length ? '이번에 할 것: ' + drops.join(', ') + '\n' : ''}${r.attention ? '주의: ' + r.attention + '\n' : ''}끝나면 워크북 실험실 E4에서 결과를 기록하세요.`,
      }]), 'text/calendar');
    }));
    el.querySelectorAll('[data-pact]').forEach(b => b.addEventListener('click', async () => {
      const r = find(b.dataset.pact);
      const drops = C.safetyList.filter(s => (r.drop || []).includes(s.id)).map(s => s.drop);
      const text = `${r.when ? `${+r.when.slice(5, 7)}월 ${+r.when.slice(8, 10)}일에 ` : '이번 주에 '}${r.situation}에서 작은 연습을 하나 해 보려고 해${drops.length ? ` (${drops[0]})` : ''}. 끝나고 어땠는지 한번 물어봐 줄래?`;
      const out = el.querySelector(`[data-pactmsg="${r.id}"]`);
      const msg = await CWShare.shareOrCopy(text, '실험 약속');
      out.textContent = msg ? `${msg} · "${text}"` : `직접 복사해 주세요: "${text}"`;
    }));
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '한 번 더 누르면 삭제'; return; }
      Store.save(d => (d.exp.e4 = d.exp.e4.filter(x => x.id !== b.dataset.del)));
      e4(el);
    }));
    el.querySelectorAll('[data-outcome]').forEach(b => b.addEventListener('click', () => {
      const card = b.closest('.rec'), box = card.querySelector('.outform');
      const r = Store.get().exp.e4.find(x => x.id === b.dataset.outcome);
      b.hidden = true; box.hidden = false;
      const p = 'o' + r.id;
      box.innerHTML = `
        <label class="f" for="${p}w">실제로 무슨 일이 일어났나요?</label><textarea id="${p}w" maxlength="400"></textarea>
        <label class="f" for="${p}o">사람들은 실제로 어떻게 반응했나요?<small>보고 들은 것만. 짐작은 빼고.</small></label><textarea id="${p}o" maxlength="400"></textarea>
        <label class="f">예측한 일이 일어났나요?</label>${ui.likert(p + 'out', null, ['전혀', '일부', '예측대로'], false)}
        ${ui.slider(p + 'b', '지금은 그 예측을 얼마나 믿나요?', r.before, ['전혀', '완전히'])}
        <label class="f" for="${p}l">알게 된 것, 다음 실험</label><textarea id="${p}l" maxlength="400"></textarea>
        <div class="btns"><button class="btn small" type="button" data-save>결과 저장</button></div>`;
      ui.bindSliders(box);
      box.querySelector('[data-save]').addEventListener('click', () => {
        const out = ui.radioVal(box, p + 'out');
        if (out == null || !ui.val(box, p + 'w')) { box.querySelector('[data-save]').textContent = '일어난 일과 예측 결과를 입력해 주세요'; return; }
        Store.save(d => Object.assign(d.exp.e4.find(x => x.id === r.id), { status: 'done', what: ui.val(box, p + 'w'), others: ui.val(box, p + 'o'), outcome: out, after: ui.num(box, p + 'b'), learn: ui.val(box, p + 'l'), doneDate: new Date().toISOString() }));
        e4(el);
      });
    }));
  }

  /* ---------- E5 ---------- */
  function e5(el) {
    const list = Store.get().exp.e5;
    const S = { theme: null, pred: 60 };
    const render = () => {
      const th = C.surveyThemes.find(t => t.id === S.theme);
      el.innerHTML = head('e5', `<p class="lead">"얼굴이 빨개지면 사람들이 나를 이상하게 볼 것"이라는 믿음은 내 머릿속에서만 확인되었습니다. 다른 사람들이 실제로 어떻게 생각하는지 물어보는 것이 설문 실험입니다. CT-SAD에서 치료자가 자주 쓰는 방법입니다.</p>`) + `
        <div class="card"><h3>1. 확인하고 싶은 것</h3>${ui.likert('th', C.surveyThemes.findIndex(t => t.id === S.theme), C.surveyThemes.map(t => t.label), false, 'wrapg')}</div>
        ${th ? `
        <div class="card"><h3>2. 예측</h3>${ui.slider('pred', `응답자 중 몇 %가 "${th.label}"을(를) 보면 그 사람을 덜 좋게 볼까요?`, S.pred, ['0%', '100%'])}</div>
        <div class="card"><h3>3. 질문 보내기</h3>
          <p class="small muted">5~10명에게 보내 보세요. 친한 사람만이 아니라 다양한 사람에게 물으면 좋습니다. 내 이야기라고 밝히지 않아도 됩니다.</p>
          <textarea id="qtext" readonly style="min-height:150px">${esc(`[짧은 설문] 사람들이 이런 상황을 어떻게 느끼는지 궁금해서 여쭤봐요.\n\n${th.q.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n편하게 답해 주세요. 감사합니다!`)}</textarea>
          <div class="btns"><button class="btn small ghost" id="copy" type="button">질문 복사</button></div></div>
        <div class="card"><h3>4. 응답 모으기</h3><p class="small muted">응답이 모이면 숫자를 입력하세요.</p>
          ${[['n', '응답한 사람'], ['notice', '알아차린 적 있다'], ['neg', '덜 좋게 봤다'], ['self', '본인도 경험했다']].map(([k, l]) => `<div class="q" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><span>${l}</span><span class="stepper"><button type="button" data-k="${k}" data-d="-1" aria-label="${l} 줄이기">−</button><b id="c${k}">0</b><button type="button" data-k="${k}" data-d="1" aria-label="${l} 늘리기">+</button></span></div>`).join('')}
          <div id="res"></div>
          <label class="f" for="learn">알게 된 것</label><textarea id="learn" maxlength="400"></textarea>
          <div class="btns"><button class="btn" id="save" type="button">기록 저장</button></div></div>` : ''}
        ${list.length ? `<h2>지난 설문</h2><div class="list">${list.map(r => `<div class="rec"><div class="meta">${fmtDate(r.date)} · ${esc(r.label)}</div>
          ${chart.bars([{ label: '예측: 덜 좋게 볼 사람', value: r.pred, max: 100, text: r.pred + '%', cls: 'high' }, { label: `실제 (${r.counts.n}명 중 ${r.counts.neg}명)`, value: r.actual, max: 100, text: r.actual + '%' }])}
          ${r.learn ? `<blockquote>${esc(r.learn)}</blockquote>` : ''}</div>`).join('')}</div>` : ''}`;
      ui.bindSliders(el);
      el.querySelectorAll('input[name=th]').forEach(r => r.addEventListener('change', () => { S.theme = C.surveyThemes[+r.value].id; render(); }));
      if (!th) return;
      const counts = { n: 0, notice: 0, neg: 0, self: 0 };
      const showRes = () => {
        const res = el.querySelector('#res');
        res.innerHTML = counts.n ? chart.bars([
          { label: '예측: 덜 좋게 볼 사람', value: ui.num(el, 'pred'), max: 100, text: ui.num(el, 'pred') + '%', cls: 'high' },
          { label: '실제: 덜 좋게 본 사람', value: Math.round(counts.neg / counts.n * 100), max: 100, text: Math.round(counts.neg / counts.n * 100) + '%' },
          { label: '본인도 경험한 사람', value: Math.round(counts.self / counts.n * 100), max: 100, text: Math.round(counts.self / counts.n * 100) + '%', cls: 'mid' },
        ]) : '';
      };
      el.querySelectorAll('.stepper button').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k;
        counts[k] = Math.max(0, counts[k] + +b.dataset.d);
        if (k !== 'n') counts[k] = Math.min(counts[k], counts.n);
        if (k === 'n') ['notice', 'neg', 'self'].forEach(x => (counts[x] = Math.min(counts[x], counts.n)));
        Object.keys(counts).forEach(x => (el.querySelector('#c' + x).textContent = counts[x]));
        showRes();
      }));
      el.querySelector('#pred').addEventListener('input', e => { S.pred = +e.target.value; showRes(); });
      el.querySelector('#copy').onclick = () => {
        const t = el.querySelector('#qtext'), b = el.querySelector('#copy');
        (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(() => (b.textContent = '복사됨'), () => { t.select(); b.textContent = '선택됨, 직접 복사하세요'; });
      };
      el.querySelector('#save').onclick = () => {
        if (!counts.n) { el.querySelector('#save').textContent = '응답 수를 먼저 입력해 주세요'; return; }
        Store.save(d => d.exp.e5.unshift({ id: uid(), date: new Date().toISOString(), theme: th.id, label: th.label, pred: ui.num(el, 'pred'), counts: { ...counts }, actual: Math.round(counts.neg / counts.n * 100), learn: ui.val(el, 'learn') }));
        location.hash = '#track';
      };
    };
    render();
  }

  /* ---------- E6 ---------- */
  function e6(el) {
    const helps = [{ id: 'solve', label: '다음에 할 일을 실제로 찾았다' }, { id: 'prep', label: '다음 상황에 더 잘 대비하게 됐다' }];
    const harms = [{ id: 'mood', label: '기분이 더 나빠졌다' }, { id: 'sleep', label: '잠들기 어려웠다' }, { id: 'image', label: '내 모습이 점점 더 이상하게 기억났다' }, { id: 'fear', label: '다음 상황이 더 두려워졌다' }, { id: 'avoid', label: '그 사람이나 자리를 피하고 싶어졌다' }];
    const plans = ['곱씹기를 알아차리면 "지금 곱씹는 중"이라고 이름 붙이고, 지금 하는 일로 주의를 옮긴다', '하루 15분 "검토 시간"을 정해 두고, 그 전까지는 미룬다', '실제로 보고 들은 것만 한 줄 적고 덮는다'];
    el.innerHTML = head('e6', `<p class="lead">끝난 뒤 곱씹는 것은 실수에서 배우려는 노력처럼 느껴집니다. 하지만 곱씹기의 재료는 실제 상대 반응이 아니라 <b>상황 중의 불안한 느낌과 자기 이미지</b>입니다. 그래서 곱씹을수록 기억은 실제보다 나빠집니다.</p>`) + `
      <form id="f" novalidate>
        <div class="card"><h3>1. 무엇을 곱씹었나요?</h3>
          <label class="f" for="ev">어떤 상황이었나요?</label><input type="text" id="ev" maxlength="200">
          <label class="f" for="ru">머릿속에서 되감은 장면이나 생각<small>예: "회의에서 말 더듬은 순간. 다들 날 이상하게 봤을 거야."</small></label><textarea id="ru" maxlength="400"></textarea>
          ${ui.slider('bad1', '지금 그 장면을 떠올리면, 내가 얼마나 이상해 보였다고 느껴지나요?', 70, ['전혀', '극도로'])}</div>
        <div class="card"><h3>2. 곱씹기가 남긴 것</h3>
          <p class="small muted">도움이 된 것</p>${ui.checks('help', helps)}
          <p class="small muted">손해가 된 것</p>${ui.checks('harm', harms)}</div>
        <div class="card"><h3>3. 증거 점검</h3>
          <label class="f" for="evi" style="margin-top:0">그 자리에서 실제로 보고 들은 상대 반응은 무엇이었나요?<small>짐작이나 느낌은 빼고, 관찰한 것만. 예: "팀장은 고개를 끄덕였고, 다음 안건으로 넘어갔다. 아무도 언급하지 않았다."</small></label>
          <textarea id="evi" maxlength="400"></textarea>
          ${ui.slider('bad2', '증거만 보고 다시 평가하면, 얼마나 이상해 보였을까요?', 40, ['전혀', '극도로'])}</div>
        <div class="card"><h3>4. 다음에 곱씹기가 시작되면</h3>${ui.likert('plan', null, plans, false, 'stack')}</div>
        <p id="miss" class="small muted"></p>
        <div class="btns"><button class="btn" type="submit">점검 저장</button></div>
      </form>`;
    ui.bindSliders(el);
    const f = el.querySelector('#f');
    const draft = ui.autosave(f, 'e6');
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!ui.val(f, 'ev')) { f.querySelector('#miss').innerHTML = '<b style="color:var(--danger)">상황을 적어 주세요.</b>'; return; }
      const pi = ui.radioVal(f, 'plan');
      draft.clear();
      Store.save(d => d.exp.e6.unshift({ id: uid(), date: new Date().toISOString(), event: ui.val(f, 'ev'), rum: ui.val(f, 'ru'), before: ui.num(f, 'bad1'), after: ui.num(f, 'bad2'), help: ui.checkedVals(f, 'help'), harm: ui.checkedVals(f, 'harm'), evidence: ui.val(f, 'evi'), plan: pi == null ? '' : plans[pi] }));
      location.hash = '#track';
    });
  }
})();
