/* 치료자용 요약: 인쇄(PDF 저장) 또는 텍스트 복사 */
(function () {
  const { Views, Store, esc, fmtDate } = CW;
  const C = CONTENT;
  const LV = { low: '낮음', mid: '중간', high: '높음' };
  const OUT = ['전혀 일어나지 않음', '일부 일어남', '예측대로 일어남'];

  function collect(d) {
    const exps = [
      ...d.exp.e1.map(r => ({ date: r.date, k: 'E1 비교 실험', t: `${r.topic} · 불안 A ${r.A.anx} → B ${r.B.anx}, 보였을 불안 A ${r.A.look} → B ${r.B.look}`, a: r.before, b: r.after })),
      ...d.exp.e2.map(r => ({ date: r.date, k: 'E2 비디오 피드백', t: `불안해 보임 예측 ${r.pred.anx} → 관찰 ${r.obs.anx}, 이상해 보임 ${r.pred.odd} → ${r.obs.odd}` })),
      ...d.exp.e4.map(r => ({ date: r.date, k: 'E4 행동실험', t: `${r.situation} · 예측: ${r.pred}${r.status === 'done' ? ` · 결과: ${OUT[r.outcome]}` : ' · (결과 미기록)'}`, a: r.before, b: r.status === 'done' ? r.after : null })),
      ...d.exp.e5.map(r => ({ date: r.date, k: 'E5 설문', t: `${r.label} · 덜 좋게 볼 사람 예측 ${r.pred}% → 실제 ${r.actual}% (${r.counts.n}명)` })),
      ...d.exp.e6.map(r => ({ date: r.date, k: 'E6 곱씹기 점검', t: `${r.event} · 이상해 보였을 정도`, a: r.before, b: r.after })),
    ].sort((x, y) => x.date.localeCompare(y.date));
    return { s: d.screens[0], p0: d.profiles[d.profiles.length - 1], p1: d.profiles[0], f: d.formulations[0], wk: d.weekly.slice().reverse(), exps, prog: d.program, e3: d.exp.e3.length };
  }

  Views.summary = function (el) {
    const d = Store.get();
    const x = collect(d);
    const empty = !x.s && !x.p1 && !x.f && !x.exps.length && !x.wk.length;
    const domains = Object.keys(C.domains);
    el.innerHTML = `
      <div class="noprint"><a href="#track" class="small">← 기록</a></div>
      <div class="eyebrow" style="margin-top:14px">작성일 ${fmtDate(new Date().toISOString())}</div>
      <h1>사회불안 워크북 기록 요약</h1>
      <p class="small muted">Clark &amp; Wells(1995) 인지모델 기반 자기학습 워크북의 기록입니다. 자기평가 문항은 이 워크북을 위해 새로 작성되었고 타당도가 검증되지 않았으며, 진단 정보가 아닙니다.</p>
      <div class="note noprint"><b>이 요약은 이 기기 안에서만 만들어집니다.</b> 누구에게 보여 줄지는 직접 정하세요. 인쇄 화면에서 "PDF로 저장"을 고르면 파일로 저장할 수 있습니다.</div>
      <div class="btns noprint"><button class="btn" id="print" type="button">인쇄 · PDF 저장</button><button class="btn ghost" id="copy" type="button">텍스트로 복사</button><span id="cmsg" class="small muted" role="status"></span></div>
      ${empty ? '<p class="muted" style="margin-top:28px">아직 기록이 없습니다.</p>' : ''}

      ${x.prog ? `<section class="sum-sec"><h2>진행</h2><dl class="sum-kv">
        <dt>8주 과정</dt><dd>${x.prog.finished ? `완료 (${fmtDate(x.prog.start)} ~ ${fmtDate(x.prog.finished)})` : `${x.prog.week}주차 진행 중 (시작 ${fmtDate(x.prog.start)})`}</dd>
        <dt>해 본 실험</dt><dd>${x.exps.filter(e => !e.k.startsWith('E6')).length}회 · 외부 주의 훈련 ${x.e3}회</dd></dl></section>` : ''}

      ${x.s ? `<section class="sum-sec"><h2>증상 선별 (최근)</h2><dl class="sum-kv">
        <dt>날짜</dt><dd>${fmtDate(x.s.date)}</dd>
        <dt>특징 일치 가능성</dt><dd>${LV[x.s.result.level]}</dd>
        <dt>핵심 증상 합</dt><dd>${x.s.result.core} / 20</dd>
        <dt>생활 지장·괴로움</dt><dd>${x.s.result.impairment} / 4</dd>
        <dt>지속 기간</dt><dd>${esc(C.durationOpts.find(o => o.id === x.s.result.duration).label)}</dd>
        ${x.s.situations.length ? `<dt>불안한 상황</dt><dd>${C.situations.filter(s => x.s.situations.includes(s.id)).map(s => esc(s.label)).join(', ')}</dd>` : ''}
        ${x.s.result.risk ? '<dt>자해·자살 사고</dt><dd><b style="color:var(--danger)">지난 2주 내 있음으로 응답</b></dd>' : ''}
      </dl></section>` : ''}

      ${x.p1 ? `<section class="sum-sec"><h2>모델 요소 프로파일</h2><div class="tablewrap"><table>
        <tr><th>영역 (0~4 평균)</th>${x.p0 !== x.p1 ? `<th>처음 ${fmtDate(x.p0.date)}</th>` : ''}<th>최근 ${fmtDate(x.p1.date)}</th></tr>
        ${domains.map(k => `<tr><td>${C.domains[k].name}</td>${x.p0 !== x.p1 ? `<td>${x.p0.scores[k].mean.toFixed(1)}</td>` : ''}<td>${x.p1.scores[k].mean.toFixed(1)}</td></tr>`).join('')}
      </table></div></section>` : ''}

      ${x.f ? `<section class="sum-sec"><h2>사례개념화 (최근 · ${fmtDate(x.f.date)})</h2>${CWFormu.formuHTML(x.f)}</section>` : ''}

      ${x.wk.length ? `<section class="sum-sec"><h2>주간 점검 (0~100)</h2><div class="tablewrap"><table>
        <tr><th>날짜</th><th>불안</th><th>회피</th><th>자기초점</th><th>곱씹기</th></tr>
        ${x.wk.map(w => `<tr><td>${fmtDate(w.date)}</td><td>${w.anx}</td><td>${w.avoid}</td><td>${w.self}</td><td>${w.rum}</td></tr>`).join('')}
      </table></div></section>` : ''}

      ${x.exps.length ? `<section class="sum-sec"><h2>실험 기록</h2><div class="tablewrap"><table>
        <tr><th>날짜</th><th>종류</th><th>내용</th><th>믿음 전→후</th></tr>
        ${x.exps.map(e => `<tr><td style="white-space:nowrap">${fmtDate(e.date)}</td><td style="white-space:nowrap">${e.k}</td><td>${esc(e.t)}</td><td style="white-space:nowrap">${e.a != null && e.b != null ? `${e.a} → ${e.b}` : ''}</td></tr>`).join('')}
      </table></div></section>` : ''}

      ${x.prog && x.prog.relapse ? `<section class="sum-sec"><h2>재발 방지 계획</h2><dl class="sum-kv">
        ${[['helped', '도움이 된 것'], ['learned', '알게 된 것'], ['remain', '남은 두려움'], ['signs', '경고 신호'], ['tools', '대처 방법'], ['next', '다음 실험']].filter(([k]) => x.prog.relapse[k]).map(([k, l]) => `<dt>${l}</dt><dd style="white-space:pre-wrap">${esc(x.prog.relapse[k])}</dd>`).join('')}
      </dl></section>` : ''}`;

    el.querySelector('#print').onclick = () => window.print();
    el.querySelector('#copy').onclick = async () => {
      const msg = el.querySelector('#cmsg');
      try { await navigator.clipboard.writeText(toText(x)); msg.textContent = '복사했어요'; }
      catch (e) { msg.textContent = '복사할 수 없어요. 인쇄 · PDF 저장을 이용해 주세요'; }
    };
  };

  function toText(x) {
    const L = ['[사회불안 워크북 기록 요약]', `작성일 ${fmtDate(new Date().toISOString())}`, '※ 자체 작성 문항, 타당도 미검증, 진단 아님', ''];
    if (x.prog) L.push(`8주 과정: ${x.prog.finished ? '완료' : x.prog.week + '주차 진행 중'}`);
    if (x.s) L.push(`증상 선별(${fmtDate(x.s.date)}): 가능성 ${LV[x.s.result.level]}, 핵심 ${x.s.result.core}/20, 지장 ${x.s.result.impairment}/4${x.s.result.risk ? ', 자해·자살 사고 있음으로 응답' : ''}`);
    if (x.p1) L.push('프로파일(최근): ' + Object.keys(C.domains).map(k => `${C.domains[k].name} ${x.p1.scores[k].mean.toFixed(1)}`).join(', '));
    if (x.f) L.push('', `사례개념화(${fmtDate(x.f.date)})`, `상황: ${x.f.situation}`, `자동적 사고: ${x.f.thought}`, x.f.image ? `자기 이미지: ${x.f.image}` : '', `안전행동: ${C.safetyList.filter(s => x.f.safety.includes(s.id)).map(s => s.label).concat(x.f.safetyOther ? [x.f.safetyOther] : []).join(', ')}`);
    if (x.wk.length) L.push('', '주간 점검(불안/회피/자기초점/곱씹기)', ...x.wk.map(w => `${fmtDate(w.date)}: ${w.anx}/${w.avoid}/${w.self}/${w.rum}`));
    if (x.exps.length) L.push('', '실험 기록', ...x.exps.map(e => `${fmtDate(e.date)} ${e.k}: ${e.t}${e.a != null && e.b != null ? ` (믿음 ${e.a}→${e.b})` : ''}`));
    return L.filter(l => l !== '').join('\n').replace(/\n(?=\[|주간|실험 기록|사례개념화)/g, '\n\n');
  }
})();
