const test = require('node:test');
const assert = require('node:assert');
const { buildICS, escapeICS, foldLine, fmtLocal } = require('../public/js/share.js');

test('escapeICS escapes backslash, comma, semicolon, newline', () => {
  assert.strictEqual(escapeICS('a\\b,c;d\ne'), 'a\\\\b\\,c\\;d\\ne');
});

test('fmtLocal formats floating local time', () => {
  assert.strictEqual(fmtLocal(new Date(2026, 10, 5, 19, 0)), '20261105T190000');
});

test('foldLine keeps each physical line within 75 octets and does not split characters', () => {
  const long = 'DESCRIPTION:' + '가나다라마바사'.repeat(10);
  const folded = foldLine(long);
  const lines = folded.split('\r\n');
  assert.ok(lines.length > 1);
  for (const l of lines) assert.ok(Buffer.byteLength(l, 'utf8') <= 75, `too long: ${Buffer.byteLength(l)}`);
  assert.strictEqual(lines.map((l, i) => (i ? l.slice(1) : l)).join(''), long);
  lines.slice(1).forEach(l => assert.strictEqual(l[0], ' '));
});

test('buildICS produces a calendar with event, rrule and alarm, CRLF line endings', () => {
  const ics = buildICS([{ uid: 'x1', start: new Date(2026, 10, 5, 19, 0), durationMin: 30, title: '실험, 회의', desc: '줄1\n줄2', rrule: 'FREQ=WEEKLY;COUNT=8', alarmMin: 15 }]);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.trimEnd().endsWith('END:VCALENDAR'));
  assert.ok(ics.includes('DTSTART:20261105T190000\r\n'));
  assert.ok(ics.includes('DTEND:20261105T193000\r\n'));
  assert.ok(ics.includes('SUMMARY:실험\\, 회의\r\n'));
  assert.ok(ics.includes('DESCRIPTION:줄1\\n줄2\r\n'));
  assert.ok(ics.includes('RRULE:FREQ=WEEKLY;COUNT=8\r\n'));
  assert.ok(ics.includes('TRIGGER:-PT15M'));
  assert.ok(!/[^\r]\n/.test(ics), 'bare LF found');
});

test('buildICS omits RRULE and VALARM when not given', () => {
  const ics = buildICS([{ uid: 'x2', start: new Date(2026, 0, 1, 9, 0), durationMin: 60, title: 't', desc: '' }]);
  assert.ok(!ics.includes('RRULE'));
  assert.ok(!ics.includes('VALARM'));
});
