const test = require('node:test');
const assert = require('node:assert');
const S = require('../js/scoring.js');

const base = { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0, s7: 0, duration: '<1m', suicide: 0 };

test('screen: all zero -> low, no risk', () => {
  const r = S.screenResult(base);
  assert.strictEqual(r.level, 'low');
  assert.strictEqual(r.core, 0);
  assert.strictEqual(r.risk, false);
});

test('screen: full criteria -> high', () => {
  const r = S.screenResult({ ...base, s1: 3, s2: 3, s3: 3, s4: 2, s5: 2, s6: 2, s7: 1, duration: '6m+' });
  assert.strictEqual(r.level, 'high');
  assert.strictEqual(r.core, 13);
  assert.strictEqual(r.impairment, 2);
});

test('screen: high symptoms but short duration -> mid', () => {
  const r = S.screenResult({ ...base, s1: 4, s2: 4, s4: 4, s6: 3, duration: '1-6m' });
  assert.strictEqual(r.level, 'mid');
});

test('screen: moderate fear, no impairment, short -> low', () => {
  const r = S.screenResult({ ...base, s1: 2, s2: 2, duration: '1-6m' });
  assert.strictEqual(r.level, 'low');
});

test('screen: suicide > 0 flags risk', () => {
  assert.strictEqual(S.screenResult({ ...base, suicide: 1 }).risk, true);
});

test('screen: incomplete answers -> null', () => {
  assert.strictEqual(S.screenResult({ s1: 1 }), null);
});

test('levelOf thresholds', () => {
  assert.strictEqual(S.levelOf(1.49), 'low');
  assert.strictEqual(S.levelOf(1.5), 'mid');
  assert.strictEqual(S.levelOf(2.5), 'high');
});

test('profileScores: domain and sub means', () => {
  const items = [
    { id: 'a', domain: 'beliefs', sub: 'std' },
    { id: 'b', domain: 'beliefs', sub: 'cond' },
    { id: 'c', domain: 'focus', sub: 'focus' },
  ];
  const r = S.profileScores({ a: 4, b: 2, c: 1 }, items);
  assert.strictEqual(r.beliefs.mean, 3);
  assert.strictEqual(r.beliefs.level, 'high');
  assert.strictEqual(r.beliefs.subs.std, 4);
  assert.strictEqual(r.focus.level, 'low');
});

/* ---- 주간 점검 악화 감지 ---- */
const wk = (anx, avoid, self, rum) => ({ anx, avoid, self, rum });

test('weeklyAlert: fewer than 2 records -> null', () => {
  assert.strictEqual(S.weeklyAlert([]), null);
  assert.strictEqual(S.weeklyAlert([wk(90, 90, 90, 90)]), null);
});

test('weeklyAlert: rise of 15+ over baseline -> worse', () => {
  // 최신이 앞(newest first)
  const r = S.weeklyAlert([wk(70, 70, 70, 70), wk(50, 50, 50, 50)]);
  assert.strictEqual(r.type, 'worse');
  assert.strictEqual(r.delta, 20);
});

test('weeklyAlert: small rise -> null', () => {
  assert.strictEqual(S.weeklyAlert([wk(60, 60, 60, 60), wk(50, 50, 50, 50)]), null);
});

test('weeklyAlert: two consecutive weeks composite >= 75 -> high (takes precedence)', () => {
  const r = S.weeklyAlert([wk(80, 80, 80, 80), wk(80, 75, 75, 80), wk(80, 80, 80, 80)]);
  assert.strictEqual(r.type, 'high');
});

test('weeklyAlert: baseline is the oldest record', () => {
  const r = S.weeklyAlert([wk(55, 55, 55, 55), wk(30, 30, 30, 30), wk(40, 40, 40, 40)]);
  assert.strictEqual(r.type, 'worse');
  assert.strictEqual(r.delta, 15);
});

/* ---- 기간 내 기록 수 ---- */
test('countSince counts records on/after the given date', () => {
  const arr = [{ date: '2026-11-10T00:00:00Z' }, { date: '2026-11-01T00:00:00Z' }, { doneDate: '2026-11-09T00:00:00Z', date: '2026-10-01T00:00:00Z' }];
  assert.strictEqual(S.countSince(arr, '2026-11-05T00:00:00Z'), 1);
  assert.strictEqual(S.countSince(arr, '2026-11-05T00:00:00Z', 'doneDate'), 1);
  assert.strictEqual(S.countSince(arr, null), 3);
});
