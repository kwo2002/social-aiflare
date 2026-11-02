/* 홈 */
(function () {
  const { Views, Store } = CW;

  const setMode = m => { try { localStorage.setItem('cwsad.mode', m); } catch (e) {} };
  Views.start = function (el) {
    el.innerHTML = `
      <div class="eyebrow">Clark &amp; Wells(1995) 사회불안 인지모델 기반</div>
      <h1>사람들 앞에서의 긴장, 왜 반복될까요?</h1>
      <p class="lead">긴장되는 상황을 여러 번 겪어도 좀처럼 편해지지 않는 데에는 이유가 있어요. 이곳에서는 그 이유를 설명하는 인지모델을 바탕으로, 내 긴장이 이어지는 패턴을 찾고 작은 연습으로 바꿔 봐요.</p>

      <h2>어떻게 시작할까요?</h2>
      <p>두 가지 모두 같은 원리를 바탕으로 해요. 기록은 이 기기에서 함께 쓰이고, 언제든 바꿀 수 있어요.</p>
      <div class="choose">
        <a class="pick" href="light.html" id="pick-light">
          <span class="tag">처음이라면 추천</span>
          <b>가볍게 시작하기</b>
          <span>몇 가지만 골라서 내 긴장 패턴을 알아보고, 오늘 해 볼 작은 연습 하나를 찾아요. 글을 쓰지 않아도 되고, 한 번에 5분이면 충분해요.</span>
        </a>
        <a class="pick" href="#home" id="pick-pro">
          <span class="tag">전문 워크북</span>
          <b>깊이 있게 해 보기</b>
          <span>인지모델과 치료(CT-SAD)의 원리를 자세히 배우고, 8주 과정·자기평가·여섯 가지 실험·치료자용 요약까지 모두 쓰는 워크북이에요. 상담을 받고 있거나 체계적으로 해 보고 싶은 분께 맞아요.</span>
        </a>
      </div>

      <h2>시작하기 전에 알아 두세요</h2>
      <div class="tablewrap"><table>
        <tr><td class="term" style="white-space:nowrap">근거</td><td>Clark &amp; Wells(1995)의 사회불안 인지모델과, 이를 바탕으로 한 인지치료(CT-SAD) 연구를 따랐어요. 이 치료는 영국 NICE 지침이 사회불안의 1차 치료로 권하는 방법이에요.</td></tr>
        <tr><td class="term">한계</td><td>진단 도구가 아니고 치료를 대신하지 않아요. 질문들은 이곳을 위해 새로 만든 것이라 검증된 척도가 아니에요. 연구로 확인된 효과는 치료자와 함께 한 치료에 대한 것이에요.</td></tr>
        <tr><td class="term">개인정보</td><td>계정도 서버도 없어요. 모든 기록은 이 기기의 브라우저에만 저장되고 어디로도 보내지 않아요. 영상은 저장하지 않아요.</td></tr>
        <tr><td class="term">안전</td><td>지금 많이 힘들다면 연습보다 대화가 먼저예요. 자살예방상담전화 <b>109</b> · 정신건강위기상담전화 <b>1577-0199</b> (24시간)</td></tr>
      </table></div>`;
    el.querySelector('#pick-light').onclick = () => setMode('light');
    el.querySelector('#pick-pro').onclick = () => setMode('pro');
  };

  Views.home = function (el) {
    const d = Store.get();
    const has = d.screens.length || d.profiles.length || d.formulations.length || Object.values(d.exp).some(a => a.length);
    const plannedE4 = d.exp.e4.filter(r => r.status === 'planned').length;
    const p = d.program, W = window.CWProgram ? CWProgram.WEEKS : [];
    const programCard = !p ? `<div class="card"><h3>처음이라면, 8주 과정으로 시작하세요</h3><p>CT-SAD 치료 순서를 따라 매주 할 일 하나를 안내합니다.</p><div class="btns" style="margin-top:10px"><a class="btn" href="#program">8주 과정 보기</a></div></div>`
      : p.finished ? '' : `<div class="card"><div class="eyebrow">이번 주</div><h3 style="margin-top:2px">${p.week}주차 · ${W[p.week - 1].t}</h3><div class="btns" style="margin-top:10px"><a class="btn" href="#program">이번 주 할 일 보기</a></div></div>`;
    el.innerHTML = `
      <div class="eyebrow">전문 워크북</div>
      <h1>사회불안 인지모델 워크북</h1>
      <p class="lead">인지모델을 배우고, 나의 유지 고리를 찾고, CT-SAD의 핵심 기법을 직접 실험해 봅니다. 처음이라면 8주 과정이 순서대로 안내합니다.</p>
      ${CW.safety.screenNote(d.screens)}${CW.safety.weeklyNote(d.weekly)}
      ${programCard}
      ${CWModelSVG()}
      ${has ? `<div class="card"><h3>이어서 하기</h3><ul class="tight">
        ${plannedE4 ? `<li><a href="#lab/e4">결과를 기록하지 않은 행동실험 ${plannedE4}개</a></li>` : ''}
        ${!d.formulations.length ? '<li><a href="#assess/formulation">아직 사례개념화를 하지 않았어요</a></li>' : ''}
        <li><a href="#track">주간 점검과 변화 보기</a></li></ul></div>` : ''}
      <h2>진행 방식</h2>
      <div class="grid2" style="margin-top:14px">
        <a class="tilecard" href="learn.html"><span class="tag">1단계</span><h3>이해하기</h3><p>신념, 자기초점, 안전행동, 곱씹기가 불안을 유지하는 방식과 치료의 원리</p></a>
        <a class="tilecard" href="#assess"><span class="tag">2단계</span><h3>자기평가</h3><p>증상 선별, 모델 요소 프로파일, 나만의 사례개념화 도식</p></a>
        <a class="tilecard" href="#lab"><span class="tag">3단계</span><h3>실험실</h3><p>비교 실험, 비디오 피드백, 주의 훈련, 행동실험, 설문, 곱씹기 점검</p></a>
        <a class="tilecard" href="#track"><span class="tag">계속</span><h3>기록</h3><p>주간 점검 추세와 실험 전후 믿음의 변화</p></a>
      </div>
      <p class="small muted">근거와 한계, 개인정보 안내는 <a href="#start">시작 화면</a>에, 참고문헌은 <a href="learn.html">이해하기</a> 끝에 있습니다.</p>
      <div class="btns"><a class="btn" href="#program">8주 과정 시작</a><a class="btn ghost" href="learn.html">이해하기 먼저 읽기</a></div>`;
  };
})();
