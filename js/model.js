/* Clark & Wells 모델 도식 (전문 워크북 홈과 learn.html에서 사용) */
(function () {
  function modelSVG() {
    const box = (x, y, w, h, t, s, cls = '') => `<g class="${cls}"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10"/>
      <text x="${x}" y="${s ? y - 8 : y}">${t}</text>${s ? `<text class="s" x="${x}" y="${y + 10}">${s}</text>` : ''}</g>`;
    return `<svg class="model" viewBox="0 0 640 400" role="img" aria-label="Clark와 Wells(1995) 사회불안 인지모델 도식">
      <defs>
        <marker id="m" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah" d="M0 0L8 4L0 8z"/></marker>
        <marker id="mp" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ahp" d="M0 0L8 4L0 8z"/></marker>
      </defs>
      <path class="ln" d="M320 46V72" marker-end="url(#m)"/>
      <path class="ln" d="M320 112V136" marker-end="url(#m)"/>
      <path class="ln" d="M320 176V210" marker-end="url(#m)"/>
      <path class="ln" d="M190 156 C120 156 110 250 110 318" marker-end="url(#m)"/>
      <path class="ln" d="M450 156 C520 156 530 250 530 318" marker-end="url(#m)"/>
      <path class="lp" d="M210 268 L150 318" marker-start="url(#mp)" marker-end="url(#mp)"/>
      <path class="lp" d="M430 268 L490 318" marker-start="url(#mp)" marker-end="url(#mp)"/>
      <path class="lp" d="M208 342 H432" marker-end="url(#mp)"/>
      <path class="lp" d="M488 240 H454" marker-start="url(#mp)" marker-end="url(#mp)"/>
      ${box(320, 28, 230, 34, '과거 경험')}
      ${box(320, 92, 260, 38, '가정·신념의 활성화', '높은 기준 · 조건적 · 무조건적')}
      ${box(320, 156, 260, 38, '사회적 위험 지각', '"부정적으로 평가될 것이다"')}
      ${box(320, 240, 260, 54, '사회적 대상으로서의 자기 처리', '자기초점 주의 · 관찰자 시점 이미지', 'hl')}
      ${box(110, 340, 196, 40, '안전행동', '회피형 · 인상관리형')}
      ${box(530, 340, 196, 40, '신체·인지 증상', '홍조 · 떨림 · 머리가 하얘짐')}
      ${box(564, 240, 150, 40, '예기·사후 처리', '미리 걱정 · 곱씹기')}
    </svg>
    <ol class="model-list" aria-hidden="true">
      <li><b>과거 경험</b><span>놀림, 비판, 창피했던 사건, 기질</span></li>
      <li><b>가정·신념의 활성화</b><span>높은 기준 · 조건적 신념 · 무조건적 자기신념</span></li>
      <li><b>사회적 위험 지각</b><span>"부정적으로 평가될 것이다"</span></li>
      <li class="hl"><b>사회적 대상으로서의 자기 처리</b><span>자기초점 주의 · 느낌으로 내 모습 추론 · 관찰자 시점 이미지</span></li>
      <li><b>안전행동</b><span>회피형 · 인상관리형</span></li>
      <li><b>신체·인지 증상</b><span>홍조 · 떨림 · 머리가 하얘짐</span></li>
      <li class="loop">↺ 자기 처리, 안전행동, 증상이 서로를 강화하고, 상황 전후의 예기·사후 처리가 이 고리를 다시 불러옵니다</li>
    </ol>
    <p class="model-cap">Clark &amp; Wells(1995)를 바탕으로 재구성. 점선은 서로를 강화하는 유지 고리.</p>`;
  }

  window.CWModelSVG = modelSVG;
})();
