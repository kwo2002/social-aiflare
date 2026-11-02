# Clark & Wells 사회불안 자기평가·실험 도구 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 서버 없는 정적 웹 도구로, Clark & Wells(1995) 모델 학습 · 자기평가(선별/프로파일/사례개념화) · CT-SAD 기법 실험(E1~E6) · 기록 추적을 제공한다.

**Architecture:** `index.html` + `css/app.css` + 일반 `<script>` 파일들(ES 모듈 아님 → `file://`에서도 동작). 해시 라우팅, 상태는 localStorage 한 키(`cwsad.v1`), JSON 내보내기/가져오기. 채점 로직은 순수 함수(`js/scoring.js`)로 분리해 node로 테스트.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts(Noto Serif KR / Noto Sans KR), MediaRecorder(E2), `node --test`.

**Spec:** 대화에서 승인된 설계안 (2026-11-02) — 아래 Global Constraints에 요지 기록.

## Global Constraints
- 전문성 우선: 워크북형, 설명·직접 입력 충분히. 톤: 차분한 임상(짙은 청록, 명조 제목).
- 모든 문항은 자체 작성(DSM-5 기준·모델 구성요소 기반), "검증된 척도 아님 · 진단 아님" 화면 명시.
- 데이터는 브라우저에만. 전송 없음. 비디오는 메모리(blob)에만, 저장 안 함.
- 모든 화면 하단 위기 연락처: 자살예방상담전화 109 · 정신건강위기상담 1577-0199.
- 선별에 자해/자살 사고 문항 포함 → 해당 시 위기 패널.
- 초기 기억 재구성은 학습 탭 설명만, 전문가와 함께 권고.
- 사용자 입력/가져온 JSON은 렌더 시 항상 escape.
- 라이트/다크 테마, 모바일 폭(≈400px) 지원.

## Review Focus
- 카메라 미지원/비보안 컨텍스트(file://, http) → E2가 안내 메시지와 함께 녹화 비활성, 나머지 단계는 막히지 않음.
- localStorage 차단/손상 JSON → 앱이 빈 상태로 동작, 가져오기 실패 시 오류 문구.
- 가져온 JSON에 HTML 포함 → 텍스트로 표시(실행 안 됨).
- 선별 일부 미응답 → 결과 버튼 비활성.
- 타이머 진행 중 다른 탭 이동 → 타이머 정리(interval 누수 없음).

---

### Task 1: 채점 로직 + 테스트
**Files:** Create `js/scoring.js`, `tests/scoring.test.js`
**Produces:** `CWScoring.screenResult(ans)` → `{level:'low'|'mid'|'high', core:0-20, impairment:0-4, duration, risk:boolean}`; `CWScoring.profileScores(ans, items)` → `{[domain]:{mean, level, subs:{[sub]:mean}}}`; `CWScoring.levelOf(mean)` (<1.5 low, <2.5 mid, else high).
- high: S1≥3 ∧ S2≥3 ∧ S4≥2 ∧ impairment≥2 ∧ duration='6m+'
- mid: S1≥2 ∧ S2≥2 ∧ (impairment≥2 ∨ duration='6m+')
- risk: suicide 답 > 0
- [ ] 테스트 작성 → 실패 확인 → 구현 → `node --test tests/` PASS

### Task 2: 코어(store, 라우터, 공용 UI, 차트)
**Files:** `index.html`, `css/app.css`, `js/core.js`, `js/app.js`
**Produces:** `Store.get()/save(fn)/export()/import(text)/clear()`, `esc(s)`, `route(hash)`, `ui.slider(id,label,val)`, `chart.bars(rows)`, `chart.line(points)`, `chart.compare(before,after,labels)`.

### Task 3: 이해하기 — `js/content.js`(텍스트), `js/view-learn.js`
### Task 4: 자기평가 A/B/C — `js/view-assess.js`
### Task 5: 실험실 E1~E6 — `js/view-lab.js`
### Task 6: 기록·추적 + 홈 — `js/view-track.js`, `js/view-home.js`
### Task 7: 검증 — `node --test`, 모든 스크립트 `node --check`, 브라우저에서 각 라우트 1회 확인
