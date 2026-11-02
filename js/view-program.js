/* 8주 과정: CT-SAD 순서를 따라 한 주에 한 단계씩 */
(function () {
  const { Views, Store, esc, fmtDate, ui } = CW;
  const n = CWScoring.countSince;

  /* check(d, since): 이번 주(since 이후)에 해당 기록이 있는지 */
  const weekly = { id: 'weekly', label: '주간 점검하기', link: '#track', req: true, check: (d, s) => n(d.weekly, s) > 0 };
  const WEEKS = [
    { t: '나의 고리 이해하기', why: '치료는 내 불안이 어떻게 유지되는지 함께 그리는 것에서 시작합니다. 이번 주에는 모델을 배우고, 지금 상태를 평가하고, 최근 장면으로 나만의 도식을 만듭니다.',
      tasks: [
        { id: 'read', label: '이해하기 읽기', link: 'learn.html', req: true, manual: true },
        { id: 'screen', label: '증상 선별 (자기평가 A)', link: '#assess/screen', req: true, check: d => d.screens.length > 0 },
        { id: 'profile', label: '모델 요소 프로파일 (자기평가 B)', link: '#assess/profile', req: true, check: d => d.profiles.length > 0 },
        { id: 'formu', label: '나의 사례개념화 (자기평가 C)', link: '#assess/formulation', req: true, check: d => d.formulations.length > 0 },
        { ...weekly, check: d => d.weekly.length > 0 }] },
    { t: '안전행동의 역할 확인하기', why: '안전행동이 정말 나를 지켜 주는지, 아니면 불안을 유지시키는지 직접 확인합니다. CT-SAD에서도 초기 회기에 하는 실험입니다.',
      tasks: [{ id: 'e1', label: 'E1 자기초점·안전행동 비교 실험', link: '#lab/e1', req: true, check: (d, s) => n(d.exp.e1, s) > 0 }, weekly] },
    { t: '내 모습 바로 보기', why: '불안할 때 떠오르는 내 모습은 느낌으로 만든 이미지입니다. 영상으로 실제 모습과 비교해 봅니다.',
      tasks: [{ id: 'e2', label: 'E2 비디오 피드백', link: '#lab/e2', req: true, check: (d, s) => n(d.exp.e2, s) > 0 }, weekly] },
    { t: '주의를 바깥으로', why: '주의를 옮기는 힘은 연습할수록 늘어납니다. 이번 주에는 짧은 훈련을 여러 번 하고, 다음 주부터 할 첫 행동실험을 계획합니다.',
      tasks: [
        { id: 'e3', label: 'E3 외부 주의 훈련 3회 이상', link: '#lab/e3', req: true, check: (d, s) => n(d.exp.e3, s) >= 3, count: (d, s) => `${Math.min(n(d.exp.e3, s), 3)}/3` },
        { id: 'e4plan', label: 'E4 첫 행동실험 계획하기', link: '#lab/e4', req: true, check: (d, s) => n(d.exp.e4, s) > 0 },
        weekly] },
    { t: '행동실험 1', why: '계획한 실험을 실제 상황에서 해 보고 결과를 기록합니다. 예측과 실제의 차이가 가장 큰 배움입니다.',
      tasks: [
        { id: 'e4a', label: 'E4 행동실험 결과 기록하기', link: '#lab/e4', req: true, check: (d, s) => n(d.exp.e4, s, 'doneDate') > 0 },
        { id: 'e6a', label: 'E6 곱씹기 점검 (곱씹었다면)', link: '#lab/e6', req: false, check: (d, s) => n(d.exp.e6, s) > 0 },
        weekly] },
    { t: '행동실험 2', why: '조금 더 어려운 상황으로, 또는 다른 안전행동을 내려놓는 실험으로 넓혀 갑니다. 다른 사람의 실제 생각이 궁금하다면 설문도 해 보세요.',
      tasks: [
        { id: 'e4b', label: 'E4 새 행동실험 결과 기록하기', link: '#lab/e4', req: true, check: (d, s) => n(d.exp.e4, s, 'doneDate') > 0 },
        { id: 'e5', label: 'E5 설문 조사', link: '#lab/e5', req: false, check: (d, s) => n(d.exp.e5, s) > 0 },
        weekly] },
    { t: '행동실험 3', why: '남아 있는 두려운 예측을 골라 검증합니다. 프로파일을 다시 해 보면 처음과 무엇이 달라졌는지 볼 수 있습니다.',
      tasks: [
        { id: 'e4c', label: 'E4 새 행동실험 결과 기록하기', link: '#lab/e4', req: true, check: (d, s) => n(d.exp.e4, s, 'doneDate') > 0 },
        { id: 'profile2', label: '모델 요소 프로파일 다시 하기', link: '#assess/profile', req: false, check: (d, s) => n(d.profiles, s) > 0 },
        weekly] },
    { t: '정리와 재발 방지', why: '배운 것을 정리하고, 불안이 다시 커질 때 꺼내 쓸 계획을 세웁니다. 치료의 마지막 회기에 하는 작업입니다.',
      tasks: [
        { id: 'relapse', label: '재발 방지 계획 쓰기 (아래)', req: true, check: d => !!(d.program && d.program.relapse) },
        { id: 'profile3', label: '모델 요소 프로파일 다시 하기', link: '#assess/profile', req: false, check: (d, s) => n(d.profiles, s) > 0 },
        weekly] },
  ];

  const isDone = (t, d, p) => t.manual ? !!(p.manual && p.manual[p.week + ':' + t.id]) : t.check(d, p.weekStart);
  const expCount = d => d.exp.e1.length + d.exp.e2.length + d.exp.e4.filter(r => r.status === 'done').length + d.exp.e5.length;

  Views.program = function (el) {
    const d = Store.get();
    const p = d.program;
    const notes = CW.safety.screenNote(d.screens) + CW.safety.weeklyNote(d.weekly);
    if (!p) return intro(el, notes);
    if (p.finished) return finished(el, d, notes);
    const wk = WEEKS[p.week - 1];
    const tasks = wk.tasks.map(t => ({ ...t, done: isDone(t, d, p) }));
    const reqLeft = tasks.filter(t => t.req && !t.done).length;
    const days = Math.floor((Date.now() - new Date(p.weekStart)) / 86400000);
    el.innerHTML = `
      <div class="eyebrow">8주 과정 · 시작 ${fmtDate(p.start)}</div>
      <h1>${p.week}주차 · ${wk.t}</h1>
      ${notes}
      <div class="tiles3">
        <div class="tile"><b>${p.week}/8</b><span>주차</span></div>
        <div class="tile"><b>${expCount(d)}</b><span>해 본 실험</span></div>
        <div class="tile"><b>${days + 1}일째</b><span>이번 주</span></div>
      </div>
      <div class="card">
        <h3>이번 주에 하는 이유</h3>
        <p>${wk.why}</p>
        <h3>이번 주 할 일</h3>
        <div class="tasks">${tasks.map(t => `<div class="task ${t.done ? 'done' : ''}">
          <span class="tk" aria-hidden="true">${t.done ? '✓' : ''}</span>
          <span class="tl">${esc(t.label)}${t.count ? ` <span class="muted small">${t.count(d, p.weekStart)}</span>` : ''}${t.req ? '' : ' <span class="pill">선택</span>'}</span>
          ${t.manual ? `<button class="btn small ghost" type="button" data-manual="${t.id}">${t.done ? '취소' : '했어요'}</button>` : ''}
          ${t.link ? `<a class="btn small ${t.done ? 'ghost' : ''}" href="${t.link}">${t.done ? '다시 보기' : '하기'}</a>` : ''}
        </div>`).join('')}</div>
        <p class="small muted">기록을 저장하면 자동으로 완료 표시됩니다. 일주일에 한 주차가 권장 속도이지만, 서두르지 않아도 됩니다.</p>
        <div class="btns split">
          <button class="btn" id="next" type="button" ${reqLeft ? 'disabled' : ''}>${p.week === 8 ? '과정 마치기' : `${p.week + 1}주차로 넘어가기`}</button>
          ${reqLeft ? `<button class="btn small ghost" id="skip" type="button">필수 ${reqLeft}개를 남기고 넘어가기</button>` : ''}
        </div>
      </div>
      ${p.week === 8 ? relapseForm(p.relapse) : ''}
      <h2>혼자 하지 않기</h2>
      <p>정해진 때에 알림을 받고, 누군가에게 계획을 알려 두면 끝까지 해낼 가능성이 높아집니다.</p>
      <div class="card">
        <h3>매주 알림 받기</h3>
        <p class="small muted" style="margin-top:4px">남은 ${9 - p.week}주 동안 매주 같은 때에 "이번 주 할 일 확인" 알림이 울리는 캘린더 파일을 만듭니다. 파일을 열면 휴대폰이나 PC 캘린더에 추가됩니다.</p>
        <div class="remind">
          <label class="f" for="rday">요일</label>
          <select id="rday">${['일', '월', '화', '수', '목', '금', '토'].map((d, i) => `<option value="${i}" ${i === new Date().getDay() ? 'selected' : ''}>${d}요일</option>`).join('')}</select>
          <label class="f" for="rtime">시간</label>
          <input type="time" id="rtime" value="20:00">
        </div>
        <div class="btns"><button class="btn ghost" id="ics" type="button">캘린더 파일 내려받기</button></div>
      </div>
      <div class="card">
        <h3>믿을 만한 사람에게 알리기</h3>
        <p class="small muted" style="margin-top:4px">이번 주 계획을 알리고 나중에 물어봐 달라고 부탁하는 문구입니다. 보내기 전에 원하는 대로 고쳐도 됩니다.</p>
        <textarea id="pact" maxlength="400">이번 주에 불안을 다루는 연습(${p.week}주차: ${wk.t})을 해 보려고 해. 주말쯤 어떻게 됐는지 한번 물어봐 줄래?</textarea>
        <div class="btns"><button class="btn ghost" id="sendpact" type="button">보내기 · 복사</button><span id="pactmsg" class="small muted" role="status"></span></div>
      </div>
      <div class="card">
        <h3>상담을 받고 있다면</h3>
        <p class="small muted" style="margin-top:4px">평가 결과, 사례개념화, 실험 기록을 한 장으로 정리한 요약을 치료자에게 보여 줄 수 있습니다.</p>
        <div class="btns"><a class="btn ghost" href="#summary">치료자용 요약 보기</a></div>
      </div>
      <h2>전체 과정</h2>
      <ol class="weeks">${WEEKS.map((w, i) => `<li class="${i + 1 < p.week ? 'past' : i + 1 === p.week ? 'now' : ''}"><b>${i + 1}주차</b> ${w.t}</li>`).join('')}</ol>
      <div class="btns"><button class="btn small danger" id="reset" type="button">과정 처음부터 다시 시작</button></div>`;
    const $ = s => el.querySelector(s);
    el.querySelectorAll('[data-manual]').forEach(b => b.addEventListener('click', () => {
      Store.save(d => { const k = d.program.week + ':' + b.dataset.manual; d.program.manual = d.program.manual || {}; d.program.manual[k] = !d.program.manual[k]; });
      Views.program(el);
    }));
    const advance = () => {
      Store.save(d => {
        const q = d.program;
        q.history = (q.history || []).concat([{ week: q.week, end: new Date().toISOString() }]);
        if (q.week === 8) q.finished = new Date().toISOString();
        else { q.week++; q.weekStart = new Date().toISOString(); }
      });
      Views.program(el); window.scrollTo(0, 0);
    };
    $('#next').onclick = advance;
    if ($('#skip')) $('#skip').onclick = e => {
      const b = e.currentTarget;
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '한 번 더 누르면 넘어갑니다'; return; }
      advance();
    };
    $('#reset').onclick = e => {
      const b = e.currentTarget;
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '과정 진행 상태만 초기화됩니다. 한 번 더 누르세요'; return; }
      Store.save(d => (d.program = null)); Views.program(el);
    };
    if (p.week === 8) bindRelapse(el);
    $('#ics').onclick = () => {
      const day = +$('#rday').value, [hh, mm] = ($('#rtime').value || '20:00').split(':').map(Number);
      const first = new Date(); first.setHours(hh, mm, 0, 0);
      while (first.getDay() !== day || first < new Date()) first.setDate(first.getDate() + 1);
      const url = location.href.split('#')[0] + '#program';
      CWShare.download('workbook-weekly.ics', CWShare.buildICS([{
        uid: 'weekly-' + Date.now(), start: first, durationMin: 15, alarmMin: 0,
        title: '사회불안 워크북 · 이번 주 할 일 확인',
        desc: `이번 주 할 일을 확인하고 주간 점검을 해 주세요.\n${url}`,
        rrule: `FREQ=WEEKLY;COUNT=${9 - p.week}`,
      }]), 'text/calendar');
    };
    $('#sendpact').onclick = async () => {
      const msg = await CWShare.shareOrCopy($('#pact').value, '이번 주 계획');
      if (msg) $('#pactmsg').textContent = msg; else { $('#pact').select(); $('#pactmsg').textContent = '문구를 선택했어요. 직접 복사해 주세요'; }
    };
  };

  function intro(el, notes) {
    el.innerHTML = `
      <div class="eyebrow">8주 과정</div>
      <h1>한 주에 한 단계씩</h1>
      <p class="lead">CT-SAD 치료의 순서를 따라, 매주 해야 할 일을 하나씩 제시합니다. 효과는 읽는 것보다 <b>실제로 해 본 실험의 수</b>에서 나옵니다. 정해진 주기로 꾸준히 할 때 끝까지 해낼 가능성도 높아집니다.</p>
      ${notes}
      <ol class="weeks">${WEEKS.map((w, i) => `<li><b>${i + 1}주차</b> ${w.t}</li>`).join('')}</ol>
      <div class="note"><b>권장 방법</b> · 매주 같은 요일에 이 페이지를 열어 그 주의 할 일을 확인하세요. 휴대폰 캘린더에 매주 반복 알림을 만들어 두면 도움이 됩니다. 상담을 받고 있다면 치료자와 함께 진행하면 더 좋습니다.</div>
      <div class="btns"><button class="btn" id="start" type="button">1주차 시작하기</button></div>`;
    el.querySelector('#start').onclick = () => {
      const now = new Date().toISOString();
      Store.save(d => (d.program = { start: now, week: 1, weekStart: now, manual: {}, history: [] }));
      Views.program(el);
    };
  }

  const RELAPSE = [
    ['helped', '가장 도움이 된 것은 무엇이었나요?', '예: 손에 힘 빼기 실험, 영상으로 본 실제 내 모습'],
    ['learned', '두려운 예측에 대해 알게 된 것은?', '예: 떨림은 생각보다 보이지 않았고, 보여도 사람들은 신경 쓰지 않았다'],
    ['remain', '아직 남아 있는 두려움이나 피하는 상황은?', ''],
    ['signs', '불안이 다시 커지고 있다는 신호는?', '예: 약속을 다시 취소하기 시작함, 할 말을 미리 외우기 시작함'],
    ['tools', '그럴 때 꺼내 쓸 방법은?', '예: E4로 실험 하나 계획하기, 외부 주의 훈련, 상담 예약'],
    ['next', '앞으로 한 달 동안 해 볼 실험은?', ''],
  ];
  function relapseForm(r = {}) {
    return `<div class="card" id="relapse"><h3>재발 방지 계획</h3>
      <p class="small muted">불안은 다시 오르내릴 수 있습니다. 그것은 실패가 아니라 배운 것을 다시 쓸 때라는 신호입니다.</p>
      ${RELAPSE.map(([k, l, ph]) => `<label class="f" for="rp-${k}">${l}</label><textarea id="rp-${k}" maxlength="500" placeholder="${esc(ph)}">${esc(r ? r[k] : '')}</textarea>`).join('')}
      <div class="btns"><button class="btn" id="rpsave" type="button">계획 저장</button><span id="rpmsg" class="small muted" role="status"></span></div></div>`;
  }
  function bindRelapse(el) {
    const draft = CW.ui.autosave(el.querySelector('#relapse'), 'relapse');
    el.querySelector('#rpsave').onclick = () => {
      const r = Object.fromEntries(RELAPSE.map(([k]) => [k, ui.val(el, 'rp-' + k)]));
      if (!r.helped && !r.signs && !r.tools) { el.querySelector('#rpmsg').textContent = '도움이 된 것, 신호, 방법 중 하나 이상 적어 주세요.'; return; }
      Store.save(d => (d.program.relapse = { ...r, date: new Date().toISOString() }));
      draft.clear();
      Views.program(el);
    };
  }

  function finished(el, d, notes) {
    const p = d.program, r = p.relapse || {};
    el.innerHTML = `
      <div class="eyebrow">8주 과정 · ${fmtDate(p.start)} ~ ${fmtDate(p.finished)}</div>
      <h1>8주 과정을 마쳤어요</h1>
      ${notes}
      <div class="tiles3">
        <div class="tile"><b>${expCount(d)}</b><span>해 본 실험</span></div>
        <div class="tile"><b>${d.weekly.length}</b><span>주간 점검</span></div>
        <div class="tile"><b>${d.exp.e3.length}</b><span>주의 훈련</span></div>
      </div>
      <div class="card"><h3>나의 재발 방지 계획</h3>
        ${RELAPSE.filter(([k]) => r[k]).map(([k, l]) => `<p class="small muted" style="margin-bottom:2px">${l}</p><div class="body" style="white-space:pre-wrap">${esc(r[k])}</div>`).join('') || '<p class="muted">작성한 계획이 없어요.</p>'}</div>
      <p>앞으로도 매주 주간 점검을 하고, 피하고 있는 상황이 생기면 <a href="#lab/e4">행동실험</a>을 계획해 보세요. 변화는 <a href="#track">기록</a>에서 볼 수 있습니다.</p>
      <div class="btns"><a class="btn" href="#track">기록 보기</a><button class="btn small danger" id="reset" type="button">새 과정 시작</button></div>`;
    el.querySelector('#reset').onclick = e => {
      const b = e.currentTarget;
      if (!b.dataset.armed) { b.dataset.armed = 1; b.textContent = '한 번 더 누르면 새로 시작합니다'; return; }
      Store.save(d => (d.program = null)); Views.program(el);
    };
  }

  window.CWProgram = { WEEKS };
})();
