# FunFan v1.0 — 변경 이력

프로토타입의 주요 변경 사항. 디자인 업데이트 시점을 파악하고
개발 쪽에서 무엇을 동기화해야 할지 판단하는 용도.

> **원칙**: 개별 커밋보다 **개발에 영향을 주는 의미 있는 변경**을 묶어서 기록.
> 상세 변경은 `git log`로 확인 가능.

---

## Unreleased

_현재 진행 중인 작업은 여기에 추가되어, 안정되면 다음 릴리즈로 이동._

---

## 2026-04-19 — 개발 핸드오프 정식 배포

### 추가
- **`handoff/` 폴더** 신설 — 개발팀 전달용 자료
  - `design-tokens.json` / `tailwind-preset.ts` — Tailwind 프리셋
  - `COMPONENTS.md` — 26개 컴포넌트 → shadcn 매핑
  - `ICONS.md` — 31개 아이콘 → lucide-react 매핑
  - `ARCHITECTURE.md` / `GETTING_STARTED.md` / `CONVENTIONS.md` — 개발 문서
  - `CHANGELOG.md` — 이 파일

### 변경
- **태스크 저장 버튼 재활성화 로직** — 저장 이력이 있으면 내용 무관하게 저장 가능(빈 목록 덮어쓰기 허용)

---

## 2026-04-19 — 대규모 리팩토링

개발 이식을 쉽게 하기 위한 구조 정리. **기능 동작은 변경 없음**.

### 추가 (토큰)
- `--space-1` ~ `--space-16` — 컴포넌트 내부 절대값 간격 스케일
- `--color-shadow-subtle/light/mid` — 그림자 색상 토큰
- `--ring-width` — focus ring 두께

### 추가 (JS 모듈)
- `js/core/keyboard-focus.js` — `using-mouse` 패턴 중앙화 (7개 페이지 공용)
- `js/components/chat.js` — AI 채팅 인터랙션 모듈
  - `Chat.setup({ root, getReply, replyDelay, onReplyComplete })`
  - `Chat.typeText(el, text, scrollEl, onDone, speed)`
  - `Chat.appendBotMessage(chatArea)` / `Chat.appendMyMessage(chatArea, text)`

### 변경
- **23개 컴포넌트 CSS** — 하드코딩된 gap/padding/shadow를 토큰으로 일괄 변환
- **HTML 5개 페이지** — 중복된 채팅 로직 제거 → `Chat.setup()` 한 줄 호출
- **HTML 6개 페이지** — `using-mouse` 2줄 JS 제거 → `<script src="js/core/keyboard-focus.js">`
- **인라인 스타일 제거** — workroom.html SVG 필터 → `.svg-defs` 클래스
- **접근성** — chat textarea, task input, timer custom input, 타이머 컨트롤 버튼에 `aria-label` 추가

### 기타
- `.gitignore` 추가 — `.wrangler/` 캐시 제외

### 영향
- **토큰 재사용**: 이전엔 `gap: 8px`처럼 하드코딩 → 지금은 `var(--space-2)`
- **Tailwind 매핑 용이**: `--space-N` 체계가 `tailwind-preset.ts`의 `spacing.space-N`에 1:1 대응
- **JS 유지보수**: 채팅 로직이 단일 파일(`chat.js`)에 집중 → React 포팅 시 단일 훅(`useChat`)으로 치환 가능

---

## 2026-04-18 — 워크룸 타이머 시스템

### 추가 (컴포넌트)
- **`btn-glass`** — 반투명 white 버튼(5 states + sm/lg 사이즈)
- **`btn--sm`** — small size modifier (press scale 95%)
- **`input-wood`** — wood 컬러 반투명 숫자 입력 필드
- **`icon-pause`**, **`icon-stop`** — 아이콘 추가

### 추가 (페이지 기능)
- **워크룸 타이머** — Pomodoro 스타일 카운트다운
  - 상태 머신: idle → running ↔ paused
  - 프리셋(5/10/30/60분) + 커스텀 입력
  - 버튼 상태별 전환 애니메이션 (fade + scale + max-width collapse, 220ms)
  - Enter 키로 즉시 시작, 커스텀 값 포커스 시 초기화
- **Chango 폰트 로드** — 타이머 숫자 전용

### 변경
- **`btn-filled` → `btn-filled-nature`** — variant 분리 (wood 추가)
- **채팅 아바타 애니메이션** — `.chat-msg--new` 클래스로 스코프 → 신규 메시지만 애니메이션, 페이지 로드 시 기존 메시지는 정적

---

## 2026-04-17 — Mini Mode + 태스크 패널

### 추가
- **`task-list` / `task-row`** — 태스크 리스트 컴포넌트 (editing/readonly 모드)
- **`task-list-panel`** — 우측 슬라이드인 패널 (mini mode 전용)
- **워크룸 mini mode** — `?mode=mini&tab=0|1` 쿼리로 진입
- **`navbar--work-mode`** — 작업 종료 버튼 + 탭 표시
- **배경 이미지** — mini mode workroom 배경

### 변경
- **우측 패널 상태 localStorage 영속화** — 페이지 이동해도 유지

---

## 2026-04-15 — 색상 확장 + 피드 컴포넌트

### 추가
- **Red 색상 토큰** — `--color-red-100/50/30/0`
- **`fan-feed`** — 댓글/리뷰 피드 컴포넌트 + fade mask

### 변경
- `nature-7` → `nature-6` 으로 리네이밍
- **`wood` 색상 팔레트** — 1 ~ 6 추가
- **`my-msg`** 배경 `gray-6` → `wood-6`

---

## 2026-04-10 — Tab + Navbar 확장

### 추가
- **`tab` / `tab-group`** — 탭 컴포넌트 (5 states)
- **`navbar-tabs`** — navbar 내 탭 슬롯
- **`icon-exit-to-app`** — 작업 종료 아이콘

---

## 2026-04-08 — 페이지 확장

### 추가
- **`workroom.html`** — 워크룸 페이지 (workspace 복사 베이스)
- **`workspace-onboarding.html`** — 온보딩 (랜딩 → 확장 → AI 대화)
- **`series-post-management.html`** — 시리즈 관리
- **`account-setting.html`** — 계정 설정

### 추가 (컴포넌트)
- **`checkbox`** — 체크박스 + 라벨 패턴 (6 states)
- **`radio-card`** — 카드형 라디오 (5 states)
- **`radio-group-card`** — 라디오 카드 그룹 컨테이너

---

## 2026-04-01 — 초기 배포

### 추가
- **초기 디자인 시스템** — 색상/레이아웃/타이포 토큰
- **기본 컴포넌트** — button, chat-input, chat-msg, my-msg, msg-bubble, avatar, badge, icon, icon-btn, float-btn, send-btn, logo, navbar, panel-header, left-panel, right-panel, menu-item, stat-card, revenue-card, water-card, review-item
- **페이지** — `index.html`, `workspace.html`, `styleguide.html`
- **Vercel 배포 설정**

---

## 업데이트 노트 (개발 쪽 체크리스트)

새 버전을 pull했을 때:

1. `handoff/CHANGELOG.md` 해당 날짜 항목 확인
2. **토큰 변경**이 있으면 `tailwind-preset.ts` 덮어쓰기 → `npm run build` 동작 확인
3. **새 컴포넌트** 있으면 `COMPONENTS.md` + `styleguide.html` 로 variant 확인
4. **아이콘 추가** 있으면 `ICONS.md` lucide 매핑 확인
5. **인터랙션 변경**(ex: 애니메이션 타이밍) 있으면 실제 페이지에서 확인

---

## 기록 규칙

릴리즈 단위는 **"개발자가 동기화해야 하는 의미 있는 묶음"** 기준.
하루에 여러 커밋이 있어도 맥락이 비슷하면 한 엔트리로 묶음.

각 엔트리 형식:
```
## YYYY-MM-DD — 릴리즈 주제

### 추가 / 변경 / 제거 / 수정
- 영향받는 파일 또는 컴포넌트
- 개발 쪽이 알아야 할 포인트
```

세부 변경은 `git log` 또는 GitHub 커밋 히스토리 참조.
