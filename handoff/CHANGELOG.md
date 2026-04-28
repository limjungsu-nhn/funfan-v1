# FunFan v1.0 — 변경 이력

프로토타입의 주요 변경 사항. 디자인 업데이트 시점을 파악하고
개발 쪽에서 무엇을 동기화해야 할지 판단하는 용도.

> **원칙**: 개별 커밋보다 **개발에 영향을 주는 의미 있는 변경**을 묶어서 기록.
> 상세 변경은 `git log`로 확인 가능.

---

## v1.05.8 (2026-04-28, v1.05.7 후속)

**横読み 만화 뷰어 + 작품 수정 페이지 + 모달 SSOT 추출 + outset effects 패턴 정착.** 2개 신규 페이지, 신규 CSS 컴포넌트 0개. 모달이 들어가는 8개 페이지의 인라인 마크업이 모두 단일 JS 모듈로 통합. **기존 구현 깨지는 변경 없음**.

### 신규 페이지 (2개)

- **`viewer-yoko.html`** (NEW) — 横読み(가로) 비주얼 노벨/만화 뷰어. `index.html` 에서 `target="viewer-yoko"` + `screen.availLeft/Top` 기준 가운데 1920×1080 팝업으로 오픈. 1440 min-width 미적용(미니창 예외).
  - **레이아웃**: progress(2px) · header(52) · main(flex 1) · footer(52) — 모두 토큰화(`var(--space-0_5)` / 로컬 `--chrome-height` 등)
  - **읽기 방향**: 일본어 RTL — 좌측 nav = 次, 우측 nav = 前
  - **이미지 contain**: `.viewer-yoko__content { container-type: size }` + `.viewer-yoko__image { max-width: 50cqw; max-height: 100cqh }` 로 비율 유지하며 가용 영역에 맞춤
  - **inset stroke**: `.viewer-yoko__image-wrap::after` 가 `box-shadow: inset 0 0 0 1px var(--color-gray-6)` + `mix-blend-mode: darken` 으로 이미지에 정확히 hug
  - **slide transition**: 듀레이션 0.4s · `var(--ease-standard)` (chrome 트랜지션과 동일 토큰 공유) · 이동량 50cqw · 퇴장은 50% 시점에 opacity 0 도달 → 100% 에 translateX 종료
  - **chrome toggle**: 콘텐츠 클릭 시 progress/header/footer 가 `margin-block-start/end` 음수값 트랜지션으로 layout 에서 빠져 본문 면적이 확장 — `transform translateY` 와 달리 layout 도 함께 반응
- **`series-edit.html`** (NEW) — 작품 수정 폼. `series-register` 와 동일한 `form-card` + `thumbnail-upload` + `radio-block` 합성 (등록 폼의 수정 모드)

### 신규 JS

- **`js/components/modal-context.js`** (NEW) — `#modal-context` (作品コンテキスト 공통 모달) 의 단일 진실의 원천(SSOT)
  - `MODAL_HTML` template literal 이 마크업 정의
  - DOMContentLoaded 시 `document.body` 끝에 innerHTML 주입 · 이미 `#modal-context` 가 존재하면 skip(이중 주입 방지)
  - **사용 페이지 8개**: workroom / workspace / workspace-onboarding / series-edit / series-register / series-post-management / series-post-management-empty / account-setting — 각 페이지는 `<script src="js/components/modal-context.js" defer></script>` 한 줄 + 트리거에 `data-modal-open="#modal-context"` 만 가지면 됨
- **`js/pages/viewer-yoko.js`** (NEW) — viewer-yoko 전용 인터랙션
  - **단일 상태**: `.viewer-yoko__progress[role=progressbar]` 의 aria-valuenow/min/max 만 진실의 원천
  - **`syncProgress()`**: aria 값 → progress-bar `--progress` 너비(%) + 페이지 인디케이터 텍스트 + nav 버튼 disabled 일괄 갱신
  - **`setPage(±1)`**: aria-valuenow 갱신 후 syncProgress 재호출 → 변경 여부 boolean 반환
  - **`slide(direction)`**: stage 안의 image-wrap 을 cloneNode → 원본은 exit, 클론은 enter 클래스 부여 → animationend 후 원본 제거. `animating` 플래그로 연타 차단

### 기존 JS 변경

- **`js/components/modal.js`** — `selectTab()` 이 단일 tab-group 만 갱신하던 것을 backdrop 안의 모든 `.tab-group` 을 동시 갱신하도록 변경. step 3 에서 두 번째 탭으로 바꾸고 뒤로 가면 step 2 도 같은 탭이 노출 — 사용자 멘탈 모델 일관성

### CSS 구조 정비

- **`css/components/modal.css`** — focus ring 잘림 이슈 해결. `.modal__step` 의 가로 패딩 제거 → 자식들(summary-card / tabs / footer / label / helper / form)이 개별 `margin-inline` 으로 인셋 → 스크롤 컨테이너(`.modal__list`) 가 카드보다 넓어 outset focus ring 이 살아남음. (account-setting 패턴과 동일 — `CLAUDE.md` 규칙 13 으로 명문화)
- **`css/components/button.css`** — 변경분 미세(viewer-yoko 의 `.btn-ghost.btn--sm` 사용 시 영향 없음)
- **`css/pages/viewer-yoko.css`** (NEW) — 페이지 전용 로컬 토큰 4종(`--chrome-height` / `--progress-height` / `--nav-icon-size` / `--transition-chrome`) 정의 후 모든 수치 토큰 참조

### 신규 에셋

- `img/img_viewer_page01.png` — viewer-yoko 데모 페이지(만화 1페이지)

### 신규 핸드오프 규칙 (CLAUDE.md 규칙 13 = handoff 시 동일 원칙)

- **outset effects 패턴**: focus ring·shadow 등 박스 밖으로 나가는 효과는 "스크롤 컨테이너가 카드보다 넓고, 카드는 padding-inline 으로 인셋" 구조로 처리. 금지: 음수 마진(`margin: -Npx`) · 카드 폭 축소(`width: calc(100% - …)`) · inset outline(`outline-offset: -Npx`) · `overflow-clip-margin` 단독 시도. 이유: clip-margin 은 스크롤 축에서 무효 — 본질은 "스크롤 컨테이너의 시각적 여유" 구조에 있음.

### 개발 액션 요약

1. **viewer-yoko 라우팅**: `target="viewer-yoko"` + `window.open(href, name, "popup=yes,width=1920,height=1080,…")` 패턴 그대로 이식 가능 — Next.js 의 `Link` 대신 `<a target>` + `onClick` 핸들러
2. **공용 모달**: shadcn `Dialog` 한 곳에 `<ContextModal />` 정의 → 모든 트리거가 `data-modal-open` 속성으로 호출하는 패턴 유지(또는 컨텍스트로 open state 공유)
3. **container query**: `container-type: size` + `cqw/cqh` 는 모던 브라우저 전제. 비지원 환경 fallback 이 필요하면 ResizeObserver 로 픽셀 계산 후 CSS var 주입
4. **chrome toggle 트랜지션**: `transform translateY` 가 아닌 `margin-block-start/end` 음수값 — 본문 layout 이 함께 확장되어야 할 때 채택. transform 만으로는 layout 이 안 바뀜
5. **outset effects**: 카드 ring 이 살아야 하는 스크롤 영역은 `padding-inline >= ring-width(3px)` 보장 — 부모/형제 폭은 padding 으로만 맞춤(margin-inline 인셋)

### 하위 호환

- 기존 토큰·클래스·BEM 구조 변경 없음
- 신규 CSS 컴포넌트 0개 (`#modal-context` 는 기존 `modal` 의 SSOT 인스턴스로 추출만)
- 8개 페이지의 인라인 모달 마크업 제거는 시각·동작 동일 (modal-context.js 가 동일 마크업 주입)

---

## v1.05.7 (2026-04-28, v1.05.6 후속)

**메인 디스커버리 + 작품 등록 + 작품 관리 페이지 배치.** 4개 신규 페이지 + 7개 신규 컴포넌트 + 무한 스크롤 JS + 20장 작품 표지 이미지. **기존 구현 깨지는 변경 없음**.

### 신규 페이지 (4개)
- **`main-home.html`** (NEW) — 핀터레스트 스타일 디스커버리 피드. 4-column flex masonry + 무한 스크롤. 기존 16장(작품 표지 풀) → sentinel 도달 시 12장씩 랜덤 추가
- **`creator-series-home.html`** (NEW) — 작가용 시리즈 홈 (시리즈 정보·정원·에피소드 관리 통합 뷰)
- **`series-register.html`** (NEW) — 작품 등록 폼. `form-card` + `thumbnail-upload` + `inline-alert(error)` + `radio-block`
- **`series-post-management-empty.html`** (NEW) — `series-post-management` 의 empty state 버전. `empty-state` 컴포넌트 적용

### 신규 컴포넌트 (7개)
- **`post-card.css`** — 핀터레스트 스타일 포스트 카드 (322px · 이미지 자연 비율 · radius-btn(12) · gray-6 1px border with `mix-blend-mode: multiply` · hover overlay 30% black · 이미지 영역 한정 focus ring · 카드 전체 `:active scale(0.97)`)
- **`post-manage.css`** — 작품(시리즈) 관리 카드 + 행 (720px · padding 32/28 · 썸네일 76×108 · status badge 3종: 公開中/非公開/下書き)
- **`empty-state.css`** — 데이터 없음 플레이스홀더 (720×360 · bg-soft + gray-4 1px dashed · radius-md · 중앙 정렬 액션 버튼 + hint)
- **`form-card.css`** — 헤더 + 바디 폼 래퍼 (720px · radius-md · header 80px · body padding 0/24/32 · gap 24)
- **`thumbnail-upload.css`** — 썸네일 업로드 영역 (100% × 280 · bg-soft + gray-4 1px dashed · 첨부 후: 미리보기 + hover overlay + 削除 버튼)
- **`inline-alert.css`** — 인라인 경고/안내 배너 (padding 12/8 · radius-sm · variants: error)
- **`radio-block.css`** — 큰 면적 라디오 블록 (series-register 의 タテ読み/ヨコ読み 선택)

### 신규 JS
- **`js/pages/main-home.js`** (NEW) — IntersectionObserver 기반 무한 스크롤. 4-column 누적 height 추적 + shortest-append 전략 (CSS columns 대신 JS append-to-shortest 사용 — 기존 카드 재배치 방지). 셔플된 비복원 풀 + `RECENT_AVOID=8` 윈도우로 viewport 내 이미지 중복 차단. `history.scrollRestoration='manual'` + `scrollTo(0,0)` 으로 새로고침 시 상단 시작. `<a href="#">` 클릭 점프 차단(이벤트 위임)

### 신규 에셋
- **작품 표지 이미지 20장** — `img/img_comic_01.png` ~ `img_comic_20.png` (가로 644px · 자연 비율 유지 · 핀터레스트 masonry 풀)

### 토큰 변경
- `color.css` — `--color-red-10` (#FFEAE8 — inline alert bg), `--color-red-text` (#FB2C36 — inline alert text) **추가**
- `layout.css` — `--space-0_5` (2px), `--space-45` (180px) **추가**. `--episode-card-width` 하드코딩 1000px → `var(--p70)` (1008px) 정렬
- `typography.css` — body 의 기본 `margin: 0` 명시 (브라우저 기본 8px 제거)

### 신규 아이콘
- `icon-delete` (휴지통 — thumbnail-upload `削除` 버튼 등에서 사용)

### 변경 (인라인 스타일 제거 — Rule #1 위반 일소)
- `creative-partner-onboarding-02~05.html` 의 `style="--progress-from/to: ..."` 4건 제거
- 대신 `creative-partner-onboarding.css` 에 step modifier 클래스 추가:
  - `.creative-partner-onboarding__progress--step1` ~ `--step4`

### 변경 (styleguide 정비)
- 컴포넌트 등록 형식을 `.sg-demo-canvas` → `.sg-type-table` 로 통일 (Rule #6). 변환 6종: `post-manage`, `empty-state`, `form-card`, `thumbnail-upload`, `inline-alert`, `post-card`
- 720px 컴포넌트용 preview modifier 추가: `.sg-type-preview--post-manage / --empty-state / --form-card / --thumbnail-upload` (가로 스크롤 허용)
- `post-card` preview 322px 고정 폭 유지
- nav 평탄화 — Cards 그룹 하위 들여쓰기(`sg-nav-sub`) 해제 (불필요한 시각 위계 제거)

### 개발 액션
- **신규 페이지 우선순위**: `main-home` (디스커버리) > `series-register` (등록 플로우) > `series-post-management(-empty)` (관리)
- **`post-card` 의 `mix-blend-mode: multiply` border** — 1px gray-6 가장자리 라인. 이미지가 흰색에 가까울 때만 또렷이 보이도록 의도. shadcn 매핑 시 동일 패턴 유지(`::after` border + multiply)
- **무한 스크롤** — Pinterest 효과는 CSS columns 가 아닌 4 fixed flex columns + JS append-to-shortest 로 구현. CSS columns 사용 시 새 카드 추가마다 기존 카드가 재정렬되는 문제 회피. 카드 높이 추정식: `(colWidth × imgH/644) + 64(meta) + 28(gap)`
- **focus ring 영역 제한** — `post-card:focus-visible` 시 `.post-card__image-wrap` 에만 box-shadow ring (`button.css` 패턴 동일). 메타 영역까지 ring 이 늘어지지 않도록
- **inline alert** — `--color-red-10` / `--color-red-text` 는 Figma 고정 hex 값. 기존 red 스케일과 별도 토큰으로 유지 (디자인이 별도 hex 를 지정한 경우)

---

## v1.05.6 (2026-04-27, v1.05.5 후속)

cp-onboarding 시퀀스 **시각 디테일 보정 패치**. 신규 페이지·컴포넌트·토큰 없음. **기존 구현 깨지는 변경 없음**.

### 변경 (creative-partner-onboarding-02 — 장르 아이콘 교체)
- 디자인 레퍼런스 기준 4종 아이콘을 filled/올바른 매핑으로 교체:
  - 恋愛・ラブコメ: `icon-favorite` → **`icon-favorite-filled`**
  - 日常・ヒューマンドラマ: `icon-sentiment-very-satisfied-filled` → **`icon-light-mode`**
  - BL・GL: `icon-favorite-filled` → **`icon-filter-vintage`**
  - まだ決めていない: `icon-schedule` → **`icon-help`**

### 변경 (creative-partner-onboarding-02 — hint 위치/정렬)
- `__step2-hint` 를 `form-field` 내부 → **`form` 직속**으로 한 단계 꺼냄 (form-field 내부 종속 컨테이너에서 분리)
- `text-align: center` 추가 — 컨테이너 폭 안에서 가운데 정렬

### 변경 (cp-onboarding 02~05 — desc 텍스트 사이즈)
- `__step2-desc` 의 텍스트 클래스 `text-subtext-w4` (14px) → **`text-assist-w4`** (13px)
- 적용 페이지: `creative-partner-onboarding-02.html` ~ `-05.html` (4종)

### 변경 (cp-onboarding — 그리드 gap 분리)
- 기존 `__genre-grid, __skill-grid` 공용 룰 (`gap: 8px`) 분리:
  - `__genre-grid` (step2): **`var(--space-2_5)`** (10px)
  - `__skill-grid` (step4): `var(--space-2)` (8px) — 유지

### 정리 (dead code)
- `.creative-partner-onboarding--top` modifier 의 `padding-top: 0` 제거. 부모 `.creative-partner-onboarding` 에 padding-top 이 없어 무효였음. `align-items: flex-start` 만 남김.

### 개발 액션
- shadcn 매핑 변경 없음 — 모든 변경이 페이지 마크업/CSS 한정. 컴포넌트(`radio-list`, `form-field`, `form-input`, `icon`) 스펙 동일.
- cp-onboarding 페이지 마크업을 prod에 옮길 때 위 4종 아이콘 매핑·desc 텍스트 사이즈·hint 위치만 동기화하면 됨.

---

## v1.05.5 (2026-04-27, v1.05.4 후속)

v1.05.4 배송 이후 반영된 **인증 플로우 + 크리에이티브 파트너 온보딩 시퀀스 + radio-list 컴포넌트** 배치. **기존 구현 깨지는 변경 없음**.

### 신규 페이지 (10개)
- **`auth-login.html`** (NEW) — 로그인 화면. 이메일/비밀번호 입력 + 비밀번호 표시 토글 + `新規会員登録` 링크 (→ `auth-signup.html`). `ログイン` 버튼 → `creative-partner-onboarding-01.html`
- **`auth-signup.html`** (NEW) — 회원가입 화면 (이메일 + 인증코드 + 초대코드 대문자 자동 변환). `認証する` → `auth-signup-password.html`
- **`auth-signup-password.html`** (NEW) — 비밀번호 설정 화면. 두 개 비밀번호 input + 3-rule 검증 (`8文字以上` / `英大文字を含む` / `数字を含む`) + 불일치 시 두번째 input `form-input--error` + caution 메시지(`パスワードが一致しません`). `登録する` 항상 활성화 → 검증 통과 시 `creative-partner-onboarding-01.html`
- **`creative-partner-onboarding-01.html`** ~ **`-05.html`** — Floom 파트너 온보딩 5단계 (Step 1: 인사 + CTA · Step 2: 펜네임 + 장르 · Step 3: 대화 스타일 · Step 4: 강화하고 싶은 능력(다중) · Step 5: 직근 목표). 각 step 상단 progress bar (25/50/75/100vw) + 진입 애니메이션 (이전 step → 현재 step 600ms ease-out)
- **`creative-partner-onboarding-06.html`** (NEW · 기존 05 복제) — 캐릭터 카드 추천 (はな / ふく / トントン)

### 신규 컴포넌트
- **`css/components/radio-list.css`** (NEW) — 1줄 리스트형 라디오 (compact 변형). 두 가지 좌측 슬롯 지원:
  - `__avatar` (24px letter circle · 선택 시 black/white 반전)
  - `__icon` (20px material 아이콘 · 컨테이너에 mask-image 적용)
  - 우측 `__check` (18px · 선택 시 opacity 0→1)
  - States: default (bg-soft + gray-6 outline) · hover/pressed/focus (gray-6) · pressed scale 0.98 · selected (white + nature-3 outline + shadow-subtle/mid + 텍스트 w6)
  - `:has(.radio-list__input:checked)` 자동 selected — radio · checkbox 모두 지원

### 신규 아이콘 (11종)
- `bolt` · `castle` · `close` · `filter-vintage` · `help` · `light-mode` · `skull` · `tool-tip` · `visibility` · `visibility-off` · `visibility-on`
- `ICONS.md` 매핑 갱신, styleguide `#icons` 섹션 카드 추가
- 총 아이콘 수: 43 → **51개**

### 변경 (form-input — 공통 toggle-password 스타일)
- **`form-input.css`** 에 `[data-role="toggle-password"]` 공통 규칙 추가 — auth-login · auth-signup-password 의 페이지별 중복 스타일 제거하고 단일 공급원으로 통합
  - `aria-pressed="false"` (눈 꺼짐) → `opacity: 0.5` · `aria-pressed="true"` (눈 켜짐) → 100%
  - 색상 항상 `--color-font-primary-black-100`, 16×16 아이콘

### 변경 (토큰 신규)
- **`css/tokens/layout.css`** + **`design-tokens.json`** + **`tailwind-preset.ts`** 동기화
  - `--space-11: 44px` (cp-onboarding step1 CTA padding)
  - `--space-15: 60px` (cp-onboarding step bottom padding)
  - `--space-50: 200px` (auth · cp-onboarding 상단 오프셋)

### 변경 (cp-onboarding 페이지 CSS · 신규)
- **`css/pages/creative-partner-onboarding.css`** 전면 확장
  - `body:has(.creative-partner-onboarding)` → 흰색 배경 (cp-onboarding 1~6 공통)
  - `.creative-partner-onboarding--top` modifier — 상단 정렬 (default 중앙 정렬 오버라이드)
  - **Top progress bar** — `position: fixed` · z-index 200 · `--progress-from` / `--progress-to` 인라인 변수 → `cp-progress-grow` 600ms `cubic-bezier(0.22, 1, 0.36, 1)` keyframe 애니메이션
  - Step 1: 576px(`--p40`) 컬럼 · CTA padding `--space-11`
  - Step 2~5: 720px(`--p50`) 컬럼 · 헤더 + form + actions 구조 통일
  - 장르/스킬 2열 그리드 · 단일 컬럼 라디오 · 액션 footer 동일 패턴

### 변경 (이미지 에셋)
- **`img/bg_postit_blue.png`** · **`img/bg_postit_pink.png`** · **`img/bg_postit_yellow.png`** 색상 미세 조정 (Frame 2087333430/437/497 → 각 색상)

### 변경 (logo · 토큰 정합성)
- **`logo.css`** — `.logo--lg` `120×45` → `128×48` (auth 페이지 적용 사이즈에 맞춰 표준화)
- **`auth-login.css`** · **`auth-signup.css`** divider gap — 존재하지 않는 `--space-4_5` 폴백 / 하드코딩 `18px` → `var(--space-4)` 토큰화
- **`creative-partner-onboarding.css`** — `.creative-partner-onboarding__step2 width: 720px` → `var(--p50)` 토큰화

### 변경 (styleguide · index)
- **`styleguide.html`**
  - radio-list 섹션 신설 — 5개 정적 state (`default` / `hover` / `focus` / `pressed` / `selected`) + 인터랙티브 그룹 데모 + JS focus 키 토글
  - 신규 아이콘 11종 카드 추가 (`#icons` 섹션)
- **`index.html`**
  - styleguide 바로 아래 9개 신규 페이지 묶음 배치: `auth-login` · `auth-signup` · `auth-signup-password` · `creative-partner-onboarding-01~06`
  - 모든 신규 항목 상태 ✅ 표시

### 개발 액션 요약
1. **`radio-list` shadcn 매핑** — `RadioGroup` (또는 `CheckboxGroup`) + 리스트 아이템. avatar/icon 슬롯은 polymorphic prop, selected 자동 처리는 controlled state로 구현
2. **인증 플로우** — 3개 화면 + Floom 온보딩 6 step 라우팅 그래프 등록. 진행 바 애니메이션은 step 진입 시 prev → current 보간 (CSS 변수로 양 끝값 주입)
3. **신규 아이콘 11종** lucide 매핑은 `ICONS.md` 참고 (`bolt → Zap`, `castle → Castle`, `close → X`, `filter_vintage → Flower`, `help → HelpCircle`, `light_mode → Sun`, `skull → Skull`, `visibility → Eye`, `visibility_off → EyeOff`, `visibility_on → Eye`)
4. **form-input toggle-password** — Tailwind plugin 또는 cva 의 `aria-pressed` variant 로 opacity 토글
5. **신규 토큰 3종** (`space-11` / `space-15` / `space-50`) preset 반영 완료 — 추가 작업 없음

### 하위 호환
- 기존 토큰·클래스·BEM 구조 변경 없음
- `logo--lg` 픽셀값 변경(120→128, 45→48) — 기존에 `logo--lg` 사용처 없음(`auth-*` 신규 페이지 한정), 영향 없음
- form-input 의 `[data-role="toggle-password"]` 셀렉터는 신규 — 기존 페이지 영향 없음

---

## v1.05.4 (2026-04-24, v1.05.3 후속)

v1.05.3 배송 이후 반영된 **모달 컴포넌트 신설 + 2-step 구조 전파 + focus ring 클리핑 정책 현대화** 배치. **기존 구현 깨지는 변경 없음**.

### 신규 파일
- **`css/components/modal.css`** (NEW) — 모달 컴포넌트 CSS 전용 파일 신설 (기존 inline/page CSS 에서 추출 · 독립 컴포넌트로 승격)
- **`js/components/modal.js`** (NEW) — 모달 동작 전용 JS. 지원 동작:
  - `[data-modal-open="#id"]` 트리거 / `[data-modal-close]` 내부 닫기 / ESC / backdrop 클릭
  - body scroll lock · 열림 시 첫 focusable 자동 focus
  - 2-step slide 트랜지션 (`translateX(-50%)`) · summary-card 자동 채움 · 닫힘 후 step/애니메이션 리셋
  - radio-card 재클릭 · Enter · Space 로 step 전진
  - 비활성 step 에 `inert` 속성 자동 부여 → Tab 포커스 차단
- **`handoff/COMPONENTS.md`** — 모달 항목 신규 등록 (`.modal` / `.modal-backdrop` → shadcn `Dialog` 매핑)

### 변경 (모달 — 2-step 구조 전파)
- **단일-step 모달 → 2-step 구조** 를 4개 페이지에 전파 (workspace.html 기준)
  - 적용: `workroom.html` / `workspace-onboarding.html` / `account-setting.html` / `series-post-management.html`
  - 구조: `.modal__viewport` > `.modal__track[data-step="1|2"]` (`width: 200%`) > 2× `.modal__step` (`width: 50%`). `data-step="2"` 시 track `translateX(-50%)`
  - step1: radio-card 리스트 + `閉じる` 단일 footer
  - step2: summary-card + tabs(`キャラクター情報` / `ストーリーアーク`) + character/story panel + `modal__footer--split` (좌 `戻る` / 우 `閉じる` + `保存する`)
- **step 2 모달 스크롤 컨테이너 제거** — `.modal__form` 은 필드 수 고정이므로 `overflow-y: auto` 폐기. `flex: 1 1 0; min-height: 0` 만 유지 (남는 높이는 textarea 가 흡수)
- **step 1 스크롤 컨테이너** (`.modal__list`) 만 스크롤 유지 + `scroll-padding-block: var(--space-1)`
- **`.modal-backdrop`** 배경 토큰화 — `rgba(248, 248, 251, 0.5)` → `color-mix(in srgb, var(--color-bg-soft) 50%, transparent)` (배경 토큰 연동)
- **`.modal__footer--split > .btn:first-child`** `min-width: var(--p5)` (72px) — 좌측 단독 버튼을 우측 그룹(grid minmax) 너비와 매칭

### 변경 (클리핑 정책 — `overflow: clip` 일괄 도입)
- **`overflow: hidden` → `overflow: clip` + `overflow-clip-margin: var(--space-1)`** 로 전환 — focus ring / shadow 가 컨테이너 모서리에서 잘리던 문제 해결 (이전 v1.05.3 이하는 padding / 음수 margin 우회였음)
- **적용 범위 (전수)**:
  - **컴포넌트 CSS**: `accordion-row` (content · bundle) / `chat-input` / `review-item` / `right-panel` / `task-list` / `water-card` / `modal__viewport` · `modal__list`
  - **페이지 CSS**: `app-shell` (`.app-shell__main` — 패널 translateX 슬라이드 클리핑 유지) / `account-setting` / `series-post-management` / `workroom` (timer-start-row .btn · workroom 본체) / `workspace`
  - **styleguide**: `.sg-preview-panel` (480px)
- `overflow: clip` 은 스크롤 컨테이너를 생성하지 않음 → 불필요한 scroll context 제거 부수 효과
- 기존 padding · 음수 margin 기반 우회 로직 전부 롤백

### 변경 (토큰 · 미세 조정)
- **`navbar.css`** — 하드코딩 `height: 64px` → `var(--navbar-height)` (토큰은 v1.05.3 에 이미 존재했으나 navbar 에서 미사용)
- **`tab.css`** — 탭 padding `var(--space-3)` → `var(--space-3_5)` (12px → 14px)
- **`radio-card.css`**:
  - `.radio-card__content gap` `var(--space-1)` → `0` (title/sub 간격은 line-height 로만 제어)
  - 상태 정의 정비 — default `bg-soft + gray-6 outline` · focus `gray-6 + gray-5 ring` · selected `white + nature-3 outline` · pressed `scale 0.98`
  - **Variant `.radio-card--nav`** 신설 — 아바타 없음 + 우측 `.radio-card__chevron` (icon-chevron-right 18px · `justify-content: space-between` · padding-right 16px)
- **`css/pages/index.css`** — `html, body` 에 `min-width: var(--base)` 명시 (1440px 미만 뷰포트 가로 스크롤)
- **이미지 에셋 — `img/bg_workroom.png`** 교체

### 변경 (styleguide)
- Modal 섹션 — 정적 preview `.sg-type-preview .modal` 오버라이드 추가 (`opacity: 1; transform: none; position: static; height: 640px`). 기본 `.modal` 은 진입 애니메이션 상태(`opacity: 0 + translateY(40px)`)라 셀 안에서 보이지 않는 문제 해결
- 인터랙티브 데모 + 정적 preview 의 step 2 폼 구조를 workspace 실제 구현과 완전 동기화 (탭 라벨 `キャラクター情報` / `ストーリーアーク`, 필드 순서 · placeholder · grouping)
- `.sg-demo-note` 유틸 추가 (데모 셀 상단 설명 문구용)
- **styleguide 버튼 오타 수정** — 존재하지 않는 `btn--xs` → 실존 클래스 `btn--sm` (36px) 로 정정 (2 위치)

### 개발 액션 요약
1. **모달 컴포넌트 신설 반영** — shadcn `Dialog` 매핑으로 등록. 2-step 경우 `track` 상태 (step 1/2) 추가, slide 트랜지션은 `translateX(-50%)` 그대로
2. **`overflow-clip` 적용** — Tailwind 는 `overflow-clip` plugin 또는 `[overflow:clip] [overflow-clip-margin:4px]` arbitrary. 구형 브라우저 fallback 은 `overflow: hidden` 으로 degrade
3. **`.modal__form` 스크롤 컨테이너 제거** — cva 에서 `overflow-y-auto` 제거
4. **`img/bg_workroom.png`** 신규 에셋 반영 (CDN 또는 `public/img/`)

### 하위 호환
- 모달 외부 API(`[data-modal-open]` / `[data-modal-close]` / ESC / backdrop) 변경 없음
- 기존 토큰·클래스·BEM 구조 변경 없음
- `overflow-clip-margin` 미지원 브라우저에서는 `overflow: clip` 만 동작 (ring 일부 잘릴 수 있으나 레이아웃은 안전). `overflow: clip` 자체 미지원 시 `overflow: hidden` fallback 권장

---

## v1.05.3 (2026-04-24, v1.05.2 후속)

v1.05.2 배송 이후 반영된 아바타 시각 정비 배치. **기존 구현 깨지는 변경 없음** — 아바타 이미지 교체 + 일부 아바타 원형 클리핑 정책 통일.

### 변경 (이미지 에셋)
- **`img/img_avatar01.png`** · **`img/img_avatar02.png`** 신규 교체 — **176×176 정사각 RGBA** (루피 / 양). 기존은 투명 모서리의 원형 디자인이었으나 새 이미지는 사각 프레임에 가득 찬 일러스트
- **`css/components/avatar.css`** 의 `.avatar-01` / `.avatar-02` base64 data URI 재임베딩 — 새 PNG로 동기화 (data URI 방식이라 파일 교체만으로는 반영되지 않아 필수)

### 변경 (컴포넌트 — 클리핑 정책)
- **`character-card__portrait`** — 기존 `132×124 직사각 display:block` → **`124×124 원형 클리핑`**
  - `border-radius: 50%` + `object-fit: cover` + `object-position: center`
  - `background: var(--color-wood-6)` 로 이미지 로딩 전/알파 영역 fallback
  - **의도**: "어떤 이미지가 들어와도 동그라미로 렌더"되도록 — 원본 PNG 형태와 무관하게 일관된 원형 프레임 보장
  - 기존 hana/fuku/tonton PNG(132×124)는 양쪽 약 4px crop됨 — 시각적으로 미미
- **아바타 클리핑 표기 통일** — 아바타 계열 전체 `border-radius: 50%`로 일원화
  - 기존 `var(--radius-full)` (= 100px) 사용하던 2곳 → `50%` 로 교체
    - `.avatar-upload__preview` ([avatar-upload.css:34](../css/components/avatar-upload.css))
    - `.settings-form__avatar-overlay::after` ([account-setting.css:88](../css/pages/account-setting.css))
  - 최종 적용 범위: `.avatar` / `.accordion-row__avatar` / `.radio-card__avatar` / `.character-card__portrait` / `.avatar-upload__preview` / `.settings-form__avatar-overlay::after`
  - **의도**: `50%`는 "요소 크기와 무관하게 항상 원형"을 보장하는 CSS 관용구 — 토큰(100px)은 요소가 100px 초과 시 원이 깨짐. Tailwind `rounded-full` 과 동일 개념
  - `--radius-full` 토큰은 pill 형태(badge / tab / icon-btn / send-btn / review-item) 전용으로 계속 사용

### 개발 액션 요약
1. `img_avatar01.png` / `img_avatar02.png` 신규 에셋 반영 (CDN 또는 프로젝트 `public/img/`)
2. `character-card` cva 에 portrait 원형 클리핑 반영 — `rounded-full object-cover` (Tailwind) / `aspect-square` 고려
3. 아바타 계열 전체 `rounded-full` 통일 — `--radius-full` 토큰은 pill 전용으로 분리 (CSS `50%` ≡ Tailwind `rounded-full`)

### 하위 호환
- 기존 토큰·클래스·BEM 구조 변경 없음
- `.character-card__portrait` 크기가 `132×124` → `124×124`로 변경되어 레이아웃에 미세한 차이 발생 가능하나, `.character-card` 외곽 300×300 포스트잇 안에서 자동 중앙 정렬되어 시각 영향 미미
- 기존 HTML 마크업의 `<img width="132" height="124">` 속성은 CSS가 오버라이드하므로 그대로 유지 OK — 추후 순차적으로 `width="124" height="124"` 로 업데이트 권장

---

## v1.05.2 (2026-04-23, v1.05.1 후속)

v1.05.1 배송 이후 반영된 변경 일괄. **기존 구현 깨지는 변경 없음** — 신규 페이지 본문 완성 + 인터랙션 추가 + 라우팅 연결이 중심.

### 추가 (페이지)
- **`mypage.html` 본문 완성** — v1.05.1 쉘 상태 → 실제 페이지. 헤더(타이틀 + 이메일) + 프로필 진입 카드(`accordion-row--link.--card`) + Phase 0 안내 카드 구성
  - 페이지 레이아웃: `css/pages/mypage.css` 신설 (`.reader-account` 패턴 재사용 — 1008px 중앙 스택)
  - `index.html` 엔트리 ⏳ → ✅

### 추가 (컴포넌트 인터랙션)
- **`accordion-row` hover 효과 신설**
  - `--card` (link/접고펼 공통): box-shadow lift (4/8 `shadow-subtle` → 6/12 `shadow-soft`) + `z-index: 1` 상승 + chevron `black-100`
  - 비-card `--link`: `gray-6` 배경 tint + chevron `black-100`
  - 비-card 접고펼: 기존 `__header:hover` chevron-only 유지
  - transition `0.2s var(--ease-standard)` (background / box-shadow)

### 추가 (토큰) ⚠ 개발 싱크
- **`--color-shadow-soft: rgba(0, 0, 0, 0.06)`** — accordion-row card hover shadow 전용 (기존 `--color-shadow-subtle` 2% / `--color-shadow-light` 5% 사이 단계)
- `tailwind-preset.ts`에 **`shadow-card-hover`** preset 추가: `0px 6px 12px rgba(0,0,0,0.06), 0px 0px 1px rgba(0,0,0,0.10)`

### 변경 (라우팅)
- **모든 페이지 navbar의 `マイページ` / `ワークスペース`** 버튼을 `<a href>` 로 전환
  - `マイページ` → `mypage.html` (8개 파일: workspace · workroom · series-post-management · account-setting · reader-account-setting · workspace-onboarding · mypage · styleguide navbar demo)
  - `ワークスペース` → `workspace.html` (동일 8개 파일)
  - 스타일은 `.btn .btn-ghost` / `.btn .btn-filled-nature` 클래스 기반이라 `<a>`에서도 동일 렌더. `.btn`의 `text-decoration: none` 기본 설정으로 밑줄 없음
  - React 이식 시: `<Link>`(Next.js) 또는 `<NavLink>`(react-router) 로 감싼 `<Button asChild>` 권장

### 변경 (코드 정리)
- **`css/tokens/typography.css`** — `body { min-width: 1440px }` 하드코딩 → `var(--base)` (규칙 7 준수)
- **`handoff/tailwind-preset.ts`** — spacing `'p2-5'` (하이픈) → `'p2_5'` (언더스코어) 정정. `design-tokens.json`·`css/tokens/layout.css`와 네이밍 일치
- **의도 주석 보강** — Figma 고정값임을 명시:
  - `css/pages/workroom.css` — timer `font-size: 80px` + `rgba(78,71,56)` stroke/shadow
  - `css/components/chat-input.css` — `width: 256px`
  - `css/pages/account-setting.css` — 폼 액션 `.btn--sm { min-width: 84px }`
- **`series-home.html`** — `js/core/keyboard-focus.js` 로드 추가 (프로젝트 일관성)
- **`styleguide.html` icon showcase** — `.icon-bar-chart-4-bars` alias 표기 추가 (`.icon-bar-chart`와 동일 mask)

### 개발 액션 요약
1. `tailwind-preset.ts` 재import — `shadow-card-hover` preset 추가 + `p2_5` 네이밍 정정
2. `mypage` 페이지 라우트 추가 (`/app/mypage` 등)
3. `accordion-row` cva 에 hover variant 반영 — card variant는 shadow lift + z-index, 비-card link 는 배경 tint
4. navbar의 프로필/워크스페이스 버튼을 `<Link>` 감싼 `<Button asChild>` 로 전환

---

## v1.05.1 (2026-04-22, v1.05 후속)

v1.05 오후 배송(`37fa0ec` 시점) 이후 반영된 변경 일괄 정리.
**시각 변화 0 · 기존 구현 깨지는 변경 없음** — 신규 페이지/컴포넌트 추가분과 토큰 확장이 중심.

### 추가 (페이지)
- **`reader-account-setting.html`** — 리더 계정 설정 본문 완성
  - 구성: navbar + `.reader-account` 래퍼 → 7개 accordion 섹션(프로필·알림·계정 등) + 저장/취소 액션
  - 사용 컴포넌트: `accordion-row` · `section-label` · `form-field` · `form-input` · `avatar-upload` · `button`
  - `index.html` 엔트리 ✅ 표시
- **`mypage.html`** — 마이페이지 쉘만 생성 (navbar + `.reader-account` 래퍼). **본문은 다음 배치 예정** (이번 배치에서는 작업 대상 아님)

### 추가 (컴포넌트)
- **`section-label`** — 리스트/카드 그룹 상단 헤딩 컴포넌트로 추출. 재사용 가능한 유틸
- **`badge--nature`** — badge에 nature 컬러 variant 추가

### 추가 (JS)
- **`js/components/form-input.js`** — 컨테이너 padding 영역 클릭 시 내부 input/textarea로 포커스 위임 · 클릭 지점이 field 밖이면 caret을 값 끝으로 이동

### 변경 (컴포넌트)
- **`accordion-row`** — trailing 영역 variants 3종 추가(avatar / badge / icon-only) · `--link` variant 데모 추가 · chevron hover 시 색상 세분화(기본 상태에서만 darken) · title line-height 26 고정 + body row-gap 2px 로 컨테이너 높이 안정화
- **`avatar-upload`** — gap 20px 유지 + 컨테이너 padding 제거 · `form-field`가 `avatar-upload` 포함 시 `:has()`로 16px 간격 보정
- 하드코딩 정리: shadow `rgba` → `--color-shadow-*` 토큰 · `#000` → `--color-black-100` · 하드코딩된 font-size/line-height/weight → typography 토큰

### 변경 (토큰) ⚠ 개발 싱크 필요
- **Spacing Scale 확장**: `--space-2_5: 10px`, `--space-3_5: 14px` 추가 — 기존에 하드코딩되던 10px/14px gap·padding을 토큰화
- **Border Radius 스케일 전면 개편**: 기존 `--radius-sm: 10px` / `--radius-full: 100px` 2개 → **8개 시맨틱 토큰**으로 확장
  - `--radius-xs: 4px` / `--radius-2xs: 8px` / `--radius-sm: 10px` / `--radius-btn: 12px` / `--radius-md: 16px` / `--radius-lg: 20px` / `--radius-xl: 24px` / `--radius-full: 100px`
- **~30개 컴포넌트 CSS의 하드코딩 px 치환 완료** — `gap: 6px` → `var(--space-1_5)`, `border-radius: 16px` → `var(--radius-md)` 등 일괄
- 추가 치환: `chat-msg.css` 22px → `var(--space-5_5)` · `panel-header.css` / `review-item--fan` 14px → `var(--space-3_5)`
- 스케일 밖 고정값은 주석으로 의도 명시: `reaction-bar.css` 14px radius / `task-list.css` 9px gap
- **파일 동기화**: `handoff/design-tokens.json`, `handoff/tailwind-preset.ts` 양쪽 모두 업데이트 (tailwind-preset.ts의 중복 borderRadius 블록 제거)
- **영향**: 시각 변화 없음 — 모든 토큰 값이 기존 하드코딩 값과 동일하게 매핑됨

### 변경 (스타일가이드)
- **Forms 섹션 → Components 개별 섹션 6개로 분리**: 기존 `<section id="forms">` Patterns 묶음을 해체하고 `#form-input` / `#form-textarea` / `#input-wood` / `#chat-input` / `#form-field` / `#avatar-upload` 독립 섹션으로 재배치 — nav 트리도 Components 그룹 끝에 6개 링크로 이동
- **Patterns > Navigation placeholder 제거** — 미구현 placeholder 섹션 삭제. 현재 Patterns에는 Modals만 남음
- **Spacing Scale / Border Radius 테이블 확장** — 신규 토큰 전부 등록

### 변경 (핸드오프 문서)
- `README.md` — v1.05.1 요약 박스 상단 배치 · "개발자 읽는 순서" 섹션 추가 · MIGRATION.md 문구를 "신규 수신자는 스킵 가능"으로 강등
- `GETTING_STARTED.md` — 페이지 리스트 현행화 (creative-partner-onboarding 01~05 · reader-account-setting · mypage · series-home 추가)
- `COMPONENTS.md` — form-input placeholder 동작 노트 갱신 (focus 시에도 유지 — `.input-wood` 전용 hide)

### 개발 액션 요약
1. `tailwind-preset.ts` 재import (토큰 확장 반영)
2. `reader-account-setting` 페이지 라우트·레이아웃 컴포넌트 추가 (기존 cva 재사용)
3. `section-label` cva 정의 추가
4. `badge` cva에 `nature` variant 축 추가
5. `accordion-row` cva에 trailing(avatar/badge/icon-only) 및 `--link` variant 축 추가
6. `form-input` 래퍼 클릭 시 내부 input 포커스 위임 동작 구현 (React에서는 `onMouseDown` 핸들러로 재현)

---

## v1.05 (2026-04-22, 오후 배송 스냅샷 = commit `37fa0ec`)

### 추가 (컴포넌트)
- **`character-card`** — 파트너 선택 화면용 조합 카드 (300×300 고정, `--character-card-size` 변수로 내부 참조)
  - **Variant (포스트잇 색)**: `.character-card--blue` / `.character-card--yellow` / `.character-card--pink` — `bg_postit_*.png` 배경. 각 variant는 `--character-card-bg` 변수로 원본 URL만 보관
  - 구성: `__inner`(padding `--space-9 --space-5_5 44px`, flex-column gap `--space-4`) → `__header`(gap `--space-3`) → `__name-row`(이름 `text-h3-w6` + 역할 `text-caption-w6` muted, baseline gap `--space-1_5`) → `__portrait`(132×124) → `__description`(caption-w6, 중앙정렬, black-50)
  - **옵션 추천 버블** `__bubble` (76×76 absolute · `top: 68px` / `left: 18px` · `img_bubble_recommend.png`)
  - **Hover / Selected 오버레이**: `role="radio"` 카드에 `:hover` 또는 `.is-selected` 적용 시 `::before` pseudo-element로 `#000` + `mix-blend-mode: overlay` + `mask-image: var(--character-card-bg)` 조합을 opacity `0 → 0.4`로 전환 (0.15s `--ease-standard`). 포스트잇 알파 영역에만 톤다운 — PNG 투명부는 오염 없음
  - **선택 체크 뱃지**: `.character-card__check` (52×58 @2x · 우상단 absolute · `top: 80px` / `right: 38px` · `img_check_selected.png`) — 기본 `display: none`, `.is-selected` 시 표시
  - **초상 스왑**: JS로 `src`를 `img_character_{name}_default.png` ↔ `_selected.png` 교체 (`data-portrait-default` / `data-portrait-selected` 속성)
  - Focus ring: `:focus-visible` 시 `--ring-width` / `--color-gray-5` ring + `border-radius: var(--radius-sm)`
  - 그림자는 PNG 자체에 포함 — CSS filter 없음 (중복 그림자 방지)

### 추가 (이미지 에셋)
- `img/bg_postit_blue.png` / `bg_postit_yellow.png` / `bg_postit_pink.png` — 포스트잇 배경 (300×300)
- `img/img_character_{hana|fuku|tonton}_{default|selected}.png` — 캐릭터 초상 6종
- `img/img_bubble_recommend.png` — 추천 버블 (76×76)
- `img/img_check_selected.png` — 선택 체크 뱃지 (104×116 원본, 52×58 @2x 표시)

### 추가 (페이지)
- **`creative-partner-onboarding-05.html` 본문 구현** — 추천 파트너 선택 화면
  - 섹션 구성: Title(h1 + subtext muted) → `.character-card` ×3 (Pink+はな 추천 버블 · Yellow+ふく · Blue+トントン) → Actions(戻る · 決定する)
  - **Radio 그룹**: `role="radiogroup"` 래퍼, 카드 단일 선택 시 `決定する` 버튼 `disabled` 해제 + `.is-selected` 토글 + 초상 스왑 (인라인 스크립트)
  - 역할·설명문: Hana 漫画鑑定士 / Fuku 作品磨き師 / Tonton こころほぐし師 (React 스펙 기반)
  - 레이아웃: `.creative-partner-onboarding` 세로 중앙 정렬 (`min-height: 100vh` + `align-items: center`), `__step5` gap `--p5`(72px), 하단 마진 `calc(var(--navbar-height) * 2)`
  - 버튼: `.btn-line` + `.btn-filled-black` 각 136px 고정폭 (actions 전용)

### 변경 (페이지)
- **`creative-partner-onboarding.css`** — step 5 레이아웃 추가 (`__step5` / `__title` / `__cards` / `__actions`). 기존 `min-height: 100%` → `100vh`, `align-items: center` 추가로 본문 수직 중앙 정렬 전환

### 변경 (스타일가이드)
- Character Card 섹션 신설 (`#character-card` · 좌측 nav 링크 포함)
  - Variants 3종 (Pink+Hana 추천 버블 / Blue+Fuku / Yellow+Tonton) · Selected State 1종 · **Interactive Demo**(단일 카드 토글) 블록
- Foundation → Images 에 `img_bubble_recommend.png` (76×76) · `img_check_selected.png` (52×58 @2x) 등록

---

## v1.04 (2026-04-21)

### 추가 (컴포넌트 · Form 계열)
- **`form-input`** — 기본 텍스트 입력 필드 (white 배경, gray-5 outline, 9상태 → 4 modifier 압축: default / hover / focus / error / disabled)
- **`form-textarea`** — 다중행 입력 필드 (min-height 96px, form-input과 동일 컬러/상태 시스템)
- **`form-field`** — label + input/textarea/avatar-upload + hint/caution 래퍼 (Figma 5 variant)
- **`avatar-upload`** — 80×80 원형 아바타 프리뷰 + 업로드 버튼 (white placeholder 배경 · gray-5 outline)
- **`accordion-row`** — 섹션 토글 / 단일 링크 행 (min-width `--p35` 504px · min-height 80px)
  - 3 variants: 기본(접힘) / `.accordion-row--active`(펼침, 제목 14→16px 부드럽게 확대 + 설명 숨김, chevron은 색상만 black-100으로 변경) / `.accordion-row--link`(토글 없는 단일 링크, chevron `.icon-exit-to-app`)
  - chevron: 기본/active는 `.icon-keyboard-arrow-down`, single link는 `.icon-exit-to-app`
  - title font-size transition으로 접힘↔펼침 자연스러운 연결
  - hover/focus 시각 효과 없음
  - `.accordion-row--card` modifier (16px radius + soft shadow) — 세팅 페이지 등 카드 나열용, 기본/active/link 전부와 병용 가능

### 추가 (아이콘)
- **`.icon-folder-open`** (Material `folder_open` · `FolderOpen`) — avatar-upload 업로드 버튼
- **신규 아이콘 5종 등록** — `.icon-error-filled`, `.icon-fast-forward-filled`, `.icon-favorite-filled`, `.icon-keyboard-arrow-down`, `.icon-sentiment-sad-filled`
- **outline ↔ filled 네이밍 컨벤션 확립** — 기본(base)=outline, filled variant=`-filled` 접미사
  - `.icon-favorite` (outline) / `.icon-favorite-filled` (solid heart) — 이전엔 base가 filled였음 → **review-item 등 기존 사용처는 `-filled`로 교체 필요**
  - `.icon-sentiment-sad` (outline) / `.icon-sentiment-sad-filled` (filled face)
  - `.icon-error` (outline) / `.icon-error-filled` (filled circle)
  - `.icon-fast-forward` (outline 4중 삼각) / `.icon-fast-forward-filled` (filled 2중 라운드 — 이전 `.icon-fast-forward`를 filled로 재분류)
- **filled-only 아이콘 `-filled` 접미사 명시화** — pair가 없어도 filled 명시:
  - `.icon-cancel` → `.icon-cancel-filled`
  - `.icon-pause` → `.icon-pause-filled`
  - `.icon-play-arrow` → `.icon-play-arrow-filled`
  - `.icon-stop` → `.icon-stop-filled`
  - `.icon-humidity-high` → `.icon-humidity-high-filled`
  - `.icon-sentiment-very-satisfied` → `.icon-sentiment-very-satisfied-filled`
  - **workroom / styleguide 사용처 전량 교체 완료**
- **SVG 소스 파일 추가**: 기존 inline-only였던 cancel / error / exit_to_app / horizontal_align_right / humidity_low / pause / play_arrow / sentiment_excited / stop / unfold_more / chevron_left이 이제 `icons/*.svg` 기반
- **파일명 컨벤션 통일**: `icons/folder-open.svg` (dash) → `icons/folder_open.svg` (underscore). 클래스명 `.icon-folder-open`은 동일. 전 파일 underscore 표기 통일

### 변경 (아이콘 사용 패턴)
- **review-item--episode 좋아요 아이콘**: `.icon-favorite` → `.icon-favorite-filled` (outline/filled 컨벤션 변경에 따른 교체)

### 리팩터 (아키텍처)
- **페이지별 `<style>` 블록 외부화** → `css/pages/*.css` 7개 파일
  - `index.css` / `workspace.css` / `workspace-onboarding.css` / `workroom.css` / `series-home.html` / `series-post-management.css` / `account-setting.css`
  - 모든 HTML 페이지 `<style>` 블록 **0개** · 인라인 `style="..."` **0개**
- 하드코딩 `gap: Npx` / `border-radius: 8px` / `height: 20px` 등 12곳 → `var(--space-N)` / `var(--radius-sm)` 토큰화
- `styleguide.html` 인라인 flex-column → `.sg-demo-stack` 데모 클래스 (styleguide.css)

### 변경 (COMPONENTS.md)
- form-field variant 목록: Figma 7종 → 5종으로 정리 (narrow width는 `.input-wood`로 대체)

### 추가 (토큰)
- **`--p12_5: 180px`** — 12.5% of 1440. account-setting 페이지 하단 여백 등에서 사용

### 추가 (페이지)
- **`account-setting.html` 중앙 영역 구현** — 720px (`--p50`) 컨텐츠 컬럼 · 72px (`--p5`) 상/좌/우 · 180px (`--p12_5`) 하단 여백 · gradient 배경 (white-50 → gray-6)
  - 헤딩 (H2/w6 + caption/w4 subtitle) + 8개 accordion-row 카드
  - 섹션: ユーザー情報(active) · 投稿ガイドライン · ヘルプ · お問い合わせ · パスワード変更(active) · メールアドレス変更 · アカウント削除申請(active, red) · ログアウト(link)
  - 재사용 컴포넌트: `accordion-row` + `accordion-row--card` + `form-field` + `form-input` + `form-textarea` + `avatar-upload` + `btn`
  - 페이지 전용 레이아웃: `.settings-page` / `.settings-page__heading` / `.settings-page__list` / `.settings-form` / `.settings-form__actions` (css/pages/account-setting.css)

---

## v1.03 (2026-04-20)

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
