# FunFan v1.0 — 변경 이력

프로토타입의 주요 변경 사항. 디자인 업데이트 시점을 파악하고
개발 쪽에서 무엇을 동기화해야 할지 판단하는 용도.

> **원칙**: 개별 커밋보다 **개발에 영향을 주는 의미 있는 변경**을 묶어서 기록.
> 상세 변경은 `git log`로 확인 가능.

---

## v1.05.1 (2026-04-22, v1.05 후속)

v1.05 오후 배송 이후, 리더 계정 설정 페이지 완성분 추가 배송.

### 추가 (페이지)
- **`reader-account-setting.html`** — 리더 계정 설정 본문 완성
  - 구성: navbar + `.reader-account` 래퍼 → 설정 아코디언 섹션들(프로필·알림·계정 등) + 저장/취소 액션
  - 사용 컴포넌트: `accordion-row` · `section-label` · `form-field` · `form-input` · `avatar-upload` · `button`
  - `index.html` 엔트리 ✅ 표시

### 영향
- **신규 컴포넌트 없음** — 기존 컴포넌트만 조합
- **토큰 변경 없음** — v1.05 토큰 그대로
- **개발 액션**: 해당 페이지 라우트·레이아웃 컴포넌트 추가 (기존 cva 재사용)

---

## v1.05 (2026-04-22)

### 추가 (페이지)
- **`mypage.html`** — 마이페이지 쉘만 생성 (navbar + `.reader-account` 래퍼). 본문은 TODO
- **`reader-account-setting.html`** — 상태 ⏳ → ✅ (index.html 엔트리 이모지 변경)

### 변경 (스타일가이드 구조)
- **Forms 섹션 → Components 개별 섹션 6개로 분리**: 기존 `<section id="forms">` Patterns 묶음을 해체하고 `#form-input` / `#form-textarea` / `#input-wood` / `#chat-input` / `#form-field` / `#avatar-upload` 독립 섹션으로 재배치 — nav 트리도 Components 그룹 끝에 6개 링크로 이동
- **Patterns > Navigation placeholder 제거** — 미구현 placeholder 섹션 삭제. 현재 Patterns에는 Modals만 남음
- **Spacing Scale / Border Radius 테이블 확장** — 신규 토큰(--space-2_5/3_5, --radius-xs/2xs/btn/md/lg/xl) 전부 등록

### 변경 (하드코딩 정리)
- `chat-msg.css` — `padding-left: 22px` → `var(--space-5_5)`
- `panel-header.css` — `padding: 14px ...` → `var(--space-3_5)`
- `review-item.css` (`--fan`) — `padding: 14px ... 14px ...` → `var(--space-3_5)`
- `reaction-bar.css` `border-radius: 14px` / `task-list.css` `gap: 9px` — 스케일 밖 고정값으로 주석 명시 (의도적 유지)

### 변경 (토큰) ⚠ 개발 싱크 필요
- **Spacing Scale 확장**: `--space-2_5: 10px`, `--space-3_5: 14px` 추가 — 기존에 하드코딩되던 10px/14px gap·padding을 토큰화
- **Border Radius 스케일 전면 개편**: 기존 `--radius-sm: 10px` / `--radius-full: 100px` 2개 → **8개 시맨틱 토큰**으로 확장
  - `--radius-xs: 4px` / `--radius-2xs: 8px` / `--radius-sm: 10px` / `--radius-btn: 12px` / `--radius-md: 16px` / `--radius-lg: 20px` / `--radius-xl: 24px` / `--radius-full: 100px`
- **20+ 컴포넌트의 하드코딩 px 치환 완료** — `gap: 6px` → `var(--space-1_5)`, `border-radius: 16px` → `var(--radius-md)` 등 일괄
- **파일 동기화**: `handoff/design-tokens.json`, `handoff/tailwind-preset.ts` 양쪽 모두 업데이트 (tailwind-preset.ts의 중복 borderRadius 블록 제거)
- **영향**: 시각적 변화 없음 — 모든 토큰 값이 기존 하드코딩 값과 동일하게 매핑됨

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
