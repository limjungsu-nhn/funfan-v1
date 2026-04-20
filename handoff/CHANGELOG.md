# FunFan v1.0 — 변경 이력

프로토타입의 주요 변경 사항. 디자인 업데이트 시점을 파악하고
개발 쪽에서 무엇을 동기화해야 할지 판단하는 용도.

> **원칙**: 개별 커밋보다 **개발에 영향을 주는 의미 있는 변경**을 묶어서 기록.
> 상세 변경은 `git log`로 확인 가능.

---

## Unreleased

### 추가 (컴포넌트)
- **`episode-card`** — `.episode-header` + `.episode-item` 리스트를 묶는 composite 카드 (1000×auto, white bg, radius 24). 에피소드 목록 UI 단위
  - 내부에 `.episode-header`를 `width: 100%`로 확장 override (기본 1000 고정 폭)
  - `js/components/episode-card.js` — 정렬 토글 (`古い順 ↔ 新しい順` + 리스트 순서 역순 재배치)
- **`review-item--episode`** — `.review-item` 에피소드 variant (에피소드 카드 내부 리뷰)
  - 상단: avatar xs + user-name(subtext-w6) · 좋아요(♥ + count)
  - 중단: `.review-score`(5 stars × 16) + 작성일(overline-w4)
  - 하단: 리뷰 텍스트(assist-w4), 섹션 사이 gap `--space-2`
- **`review-score`** — 별점 표시 (5 stars × 16×16). `--filled` 모디파이어로 채움 색상 제어 (`--color-star` 또는 `--color-gray-4`)

### 추가 (토큰)
- **`--space-20: 80px`** — 페이지 하단 여백 등에서 재사용
- **`--episode-card-width: 1000px`** — episode-card / episode-header / garden-card 공용 컨테이너 폭
- **`--color-star: #FFB800`** — review-score 별점 채움 색

### 추가 (페이지)
- **`series-home.html`** — 시리즈 홈 (진행중). garden-card + episode-card 배치, 하단 여백 `var(--space-20)`
- **index.html** — series-home.html 링크 추가 (상태 ⏳ 진행중)

### 추가 (아이콘)
- **`.icon-swap-vert`** — 정렬 토글 아이콘 (Material `swap_vert`, 세로 양방향 화살표). episode-header 정렬 버튼에 사용
- 인라인 SVG viewBox 통일: `0 0 18 18` → `0 0 24 24` (Material 원본 스펙 복원)

### 변경 (아이콘 사용 패턴)
- **review-item--episode 좋아요 아이콘** 인라인 `<svg>` → `<i class="icon icon-favorite icon--sm">` 클래스 패턴으로 치환
  - 기존: `fill="currentColor"` path 직접 지정 (색상 변경 시 `fill` 속성 수정 필요)
  - 변경: `.icon` 공통 mask-image 시스템 사용 (parent의 `color`로 `background-color: currentColor` 상속)
  - `.review-item__like-icon` 클래스 삭제 (icon 시스템으로 이관)

### 변경 (컴포넌트)
- **`emotion-btn__count`** — 폰트 굵기 400 → **600** (카운트 강조)
- **`reaction-bar`** — 배경 `var(--color-white-100)` → `var(--color-white-50)` (garden 배경 투과)
- **`garden__item`** — 바람에 살랑이는 sway 애니메이션 추가
  - `transform-origin: bottom center`, `garden-sway` keyframes (2.6~3.4s, rotate ±1.8deg)
  - `nth-child(2n/3n/5n)` 셀렉터로 개별 지연·주기 분산 (자연스러운 흔들림)
  - `prefers-reduced-motion: reduce` 시 애니메이션 off

### 정리 (코드 품질)
- **focus ring 하드코딩 제거** — `chat-input`, `menu-item`, `episode-header`, `episode-item`에서 `3px` → `var(--ring-width)`
- **gap 하드코딩 제거** — `emotion-btn`(4), `reaction-bar`(4/20/4), `garden`(12), `garden-card`(40), `episode-header`(12/4), `episode-item`(4), `episode-card`(32/16) 모두 `--space-N` 토큰으로 치환
- **episode-card 폭 토큰화** — `1000px` 직접 지정 → `var(--episode-card-width)` (episode-header / episode-card)
- **episode-header 스탠드얼론 주석 정정** — 정렬 토글 동작은 `.episode-card` 컨텍스트 전용임을 명시

### 변경 (컴포넌트)
- **`right-panel` 채팅 영역 하단 여백 확장** — `.right-panel__chat` padding `8px 0` → `8px 0 var(--space-4) 0`
  - 마지막 메시지 버블과 입력창(`.chat-input`) 사이 간격 8px → 16px
  - 스크롤 컨테이너 자체의 bottom padding이므로 스크롤 말단에서도 숨통 확보
- **`tab-group` 너비 균등화 방식 변경** — JS 측정(`getBoundingClientRect` + `--tab-min-w`) → 순수 CSS Grid (`display: inline-grid; grid-auto-columns: 1fr`)
  - 모든 탭이 가장 긴 콘텐츠 기준으로 자동 균등화
  - JS 측정 시점에 발생하던 깜빡임 완전 해소
  - 탭 개수에 무관하게 동작 → workspace/styleguide의 모든 `.tab-group`에 일괄 적용
- **`task-list` 저장 버튼 로직 재정비**
  - "현재 비어있고 저장된 데이터도 없거나 비어있을 때만" 비활성화
  - 編集 모드 진입 시 변경 없어도 활성화 (편집 모드 탈출 가능)
  - 빈 상태 저장 시 편집 모드 유지 → 최초 상태로 회귀(즉시 입력 가능)
- **`task-list` 저장 모드 hover 정리**
  - 빈 행: `cursor: default`, hover 효과 없음
  - 내용 있는 행: hover 시 체크 버튼 표시
  - 마우스 효과는 `.task-list--editing` 스코프로만 적용

### 변경 (워크룸 미니 모드)
- **navbar 정리** — マイページ / タスクリスト 버튼 제거 (미니 모드에서는 태스크 패널이 항상 표시되므로 불필요)
- **새 창 사이즈** — 1440 × 1024 → 1440 × **1080**
- **FOUC 방지 단순화** — `mini-mode-init` 클래스, `data-mini-tab` 강제 CSS 모두 제거. JS가 `.tab--selected` 클래스만 정확히 적용하면 충분.

### 정리 (코드 품질)
- `task-list` JS에서 `isSaved` 상태 제거 → `task-list--editing` 클래스를 단일 진실원으로 사용 (`isEditing()` 헬퍼)
- 동기화 어긋남 위험 제거, 약 15줄 감소

### 추가 (빌드 스크립트)
- **`scripts/build-icons.js`** — `icons/*.svg` → `css/components/icon.css` 의 `.icon-*` 클래스 자동 생성/갱신
  - 실행: `node scripts/build-icons.js` (또는 `--check` 로 diff 미리보기)
  - SVG fill 색상을 `black` 으로 정규화 → `.icon` 의 `background-color: currentColor` 가 최종 색상 제어
  - alias 규칙(`.icon-a, .icon-b {...}`) 및 orphan 클래스(SVG 파일 없는 기존 규칙) 보존
  - `handoff/ICONS.md` 에 없는 신규 클래스가 있으면 수동 작업 안내 출력
  - 의존성 없음 (Node.js 내장 `fs`/`path` 만 사용)

### 변경 (스타일가이드)
- **Task List Panel preview를 workroom과 1:1 동기화** — placeholder, 버튼 aria/icon, `autocomplete`, 저장 버튼 초기 `disabled`, `.task-list-modal` 래퍼까지 실제 마크업과 일치
- **Task List Panel 인터랙티브 데모 이식** — workroom의 전체 JS 로직 포팅 (편집/저장 모드 토글, X·check 버튼, 입력 감지, 저장 버튼 활성/비활성). **localStorage 관련(`saveToStorage`/`loadFromStorage`)은 메모리 스냅샷 변수로 대체** — styleguide는 상태 영속화 없이 동작
- **preview 스코프 CSS 오버라이드** (`css/styleguide.css`)
  - `.task-list-modal` → `position: static; display: block` (실제 사용 시 fixed 오버레이이지만 preview 셀 안에서는 인라인 렌더)
  - `.sg-type-preview--task-list-panel .task-row__btn { transition: none }` — **워크라운드**: `.task-list--editing .task-row:not(.task-row--empty) .task-row__btn { opacity: 1 }` 규칙이 `:not()` 재평가 + opacity transition 조합에서 CSSOM cascade 캐싱 이슈로 적용되지 않는 렌더 버그 회피. 실제 workroom에서는 발생하지 않으며, styleguide preview 한정 오버라이드

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
