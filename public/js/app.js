/* 첫 방문: 버전 선택. 간단 버전을 고른 사람이 주소만 치고 오면 간단 버전으로 */
(function () {
  let mode = null;
  try { mode = localStorage.getItem('cwsad.mode'); } catch (e) {}
  if (location.hash === '#learn') { location.replace('learn.html'); return; }
  if (!location.hash) {
    if (mode === 'light') { location.replace('light.html'); return; }
    if (!mode) location.hash = '#start';
  }
  window.addEventListener('hashchange', CW.route);
  CW.route();
})();
