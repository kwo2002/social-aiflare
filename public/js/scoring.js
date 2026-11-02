/* 채점 로직: 순수 함수. 브라우저에서는 window.CWScoring, node에서는 module.exports */
(function (root) {
  const SCREEN_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'duration', 'suicide'];

  function screenResult(a) {
    if (!a || SCREEN_KEYS.some(k => a[k] === undefined || a[k] === null)) return null;
    const core = a.s1 + a.s2 + a.s3 + a.s4 + a.s5;
    const impairment = Math.max(a.s6, a.s7);
    const long = a.duration === '6m+';
    let level = 'low';
    if (a.s1 >= 3 && a.s2 >= 3 && a.s4 >= 2 && impairment >= 2 && long) level = 'high';
    else if (a.s1 >= 2 && a.s2 >= 2 && (impairment >= 2 || long)) level = 'mid';
    return { level, core, impairment, duration: a.duration, risk: a.suicide > 0 };
  }

  function levelOf(mean) {
    return mean < 1.5 ? 'low' : mean < 2.5 ? 'mid' : 'high';
  }

  const avg = xs => xs.reduce((s, x) => s + x, 0) / xs.length;

  function profileScores(answers, items) {
    const out = {};
    const groups = {};
    for (const it of items) {
      if (typeof answers[it.id] !== 'number') continue;
      const g = (groups[it.domain] = groups[it.domain] || { all: [], subs: {} });
      g.all.push(answers[it.id]);
      (g.subs[it.sub] = g.subs[it.sub] || []).push(answers[it.id]);
    }
    for (const [d, g] of Object.entries(groups)) {
      const mean = avg(g.all);
      const subs = {};
      for (const [s, v] of Object.entries(g.subs)) subs[s] = avg(v);
      out[d] = { mean, level: levelOf(mean), subs };
    }
    return out;
  }

  /* 주간 점검 악화 감지. weekly는 최신순. 4문항 평균(composite) 기준.
     high: 최근 2회 연속 평균 >= 75 / worse: 최신 평균 - 첫 점검 평균 >= 15 */
  const composite = w => (w.anx + w.avoid + w.self + w.rum) / 4;
  function weeklyAlert(weekly) {
    if (!weekly || weekly.length < 2) return null;
    const [a, b] = weekly;
    if (composite(a) >= 75 && composite(b) >= 75) return { type: 'high', value: Math.round(composite(a)) };
    const delta = Math.round(composite(a) - composite(weekly[weekly.length - 1]));
    if (delta >= 15) return { type: 'worse', delta };
    return null;
  }

  /* since(ISO) 이후 기록 수. key 필드(기본 date)를 비교 */
  function countSince(arr, since, key = 'date') {
    return (arr || []).filter(r => r[key] && (!since || r[key] >= since)).length;
  }

  const api = { screenResult, levelOf, profileScores, weeklyAlert, countSince };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CWScoring = api;
})(typeof window !== 'undefined' ? window : globalThis);
