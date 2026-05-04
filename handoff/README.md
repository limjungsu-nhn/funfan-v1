# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.06.7 요약 (2026-04-30, v1.06.6 후속) — 먼저 이것만 보세요

**뷰어 3종 종료 화면(`.viewer-end`) 신규 + 페이지 헤더 패턴 통일 + main-home hero 신규 + 어두운 배경용 navbar/button 변형 + glass morphism + water-thanks 타이밍 조정.** 핵심은 (1) viewer-yoko / viewer-koma / viewer-tate 의 종료 화면 노출 + 페이지 헤더(series-register / series-manage-detail / episode-add 4종) nav+header 두 영역 분리, (2) main-home 상단에 1920×800 풀-블리드 video hero(시차 스크롤 + 동적 darken + IntersectionObserver navbar 모드 토글), (3) `.navbar--on-dark` / `.btn-ghost-dark` 신규 변형 + `.btn-glass` / `.btn-ghost-dark` 에 `backdrop-filter: blur(20px)` glass morphism 적용, (4) water-thanks 시퀀스의 낙하·splash 시간 조정.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **viewer-end (NEW)** | 뷰어 3종 공통 종료 화면 컴포넌트. text 블록(h2 28/38 w6 + p 12/18 w4 50% opacity) + 버튼 2개(btn-line 173px + btn-filled-sky w/ icon-water-drop-filled). gap 40 / 12 / 6. yoko·koma 는 root 에 `.viewer-{yoko,koma}--end` 토글로 spread/card 숨기고 노출, tate 는 stage 마지막에 1뷰포트 차지하며 자동 노출 | React: `<ViewerEnd onNext onWater />` 단일 컴포넌트 |
| **viewer-koma 종료 화면 nav 보존** | 종료 화면 노출 시 card / dots 만 `visibility: hidden` (자리·치수 보존) → prev/next nav 버튼은 그대로 동작. 마지막 코마로 prev 클릭 시 종료 화면 해제 | (CSS 토글) |
| **viewer-tate 자동 모달 제거** | 기존 스크롤 끝(>=99%) 도달 시 자동 모달 오픈 + MutationObserver 재오픈 로직 모두 제거. 종료 화면 버튼이 유일한 모달 트리거 | React: scroll observer hook 제거 |
| **icon-water-drop-filled (NEW)** | 단순 teardrop SVG path (24×24 viewBox). viewer-end 「水をあげて応援する」 버튼 아이콘 | Material `water_drop` filled 변형 |
| **페이지 헤더 nav + header 분리** | series-register / series-manage-detail / episode-add 4종(yoko·koma·tate 포함). 좌측 정렬 back link 단독 행(`__nav`) + 가운데 정렬 제목/설명(`__header`). 3-column grid 제거 | React: 두 컴포넌트로 분해 |
| **헤더 상단 패딩 통일** | series-register / episode-add 4종의 `.workspace__content` top padding 72 → 36 (`var(--space-9)`) | (토큰 변경) |
| **back button 동선** | series-register → workspace.html / series-manage-detail → series-post-management.html / episode-add 4종 → series-post-management.html | (페이지별 hardcoded href) |
| **chrome 토글 예외** | viewer 3종 모두 종료 화면 버튼 (`.viewer-end__actions button`) 클릭은 chrome(progress/header/footer) 토글에서 제외 — 텍스트·여백 클릭은 일반 토글 동작 유지 | React: stopPropagation on button only |
| **main-home hero (NEW)** | 1920×800 풀-블리드 hero. video 배경(`video/hero_main.mp4`, autoplay muted loop playsinline) + 검정 그라디언트 오버레이(Y=0 alpha 0.8 → Y=800 alpha 0) + 동적 darken (`--hero-darken` 0~1.0, 스크롤 진행도에 비례, hero 가 viewport 를 벗어나는 시점에 완전 검정). 텍스트 「最初の作品を投稿しよう」 + 안내 + CTA 2개(btn-glass / btn-filled-black). hero-bg(video) `translate3d(0, scrollY * 0.5, 0)` (0.5x) + content `top: scrollY * 0.3` (0.3x) 시차 스크롤 | React: `<MainHomeHero videoSrc onWorkroom onRegister />`, parallax 는 useEffect + rAF |
| **navbar 모드 토글** | main-home: IntersectionObserver(rootMargin -64px) 로 hero 가시성 감시. hero in viewport → `.navbar--on-dark` + `logo--white` + `btn-ghost-dark` 적용. hero 통과 → 기본 흰 배경. navbar 에 0.25s ease 트랜지션 | React: scroll-based theme switcher |
| **`.navbar--on-dark` (NEW)** | 어두운 hero/landing 배경 위 navbar 변형. 배경/그림자/border 모두 transparent (none 이 아닌 — default 와 transition 시 라인 갑자기 등장 방지). 안쪽 요소는 명시적 변형 사용: `logo--white` / `btn-ghost-dark` / `btn-filled-nature` 기본값 | (CSS variant) |
| **`.btn-ghost-dark` (NEW)** | 어두운 배경용 ghost 버튼. 5 state — Default 투명+흰 텍스트/아이콘, Hover/Focus/Pressed `rgba(0,0,0,0.5)` + glass blur, Disabled 흰색 30%. `btn--sm` / `btn--lg` 사이즈 호환 | React: variant prop |
| **`.btn-glass` glass morphism** | 기존 반투명 흰색(`var(--color-white-50)`) 위에 `backdrop-filter: blur(20px)` 추가. frosted-glass 효과. `.btn-ghost-dark` 도 동일 blur 적용 | Tailwind: `backdrop-blur-xl` 등 |
| **water-thanks 타이밍 조정** | `water-drop-fall` 1s → 0.8s (낙하 20% 빠름), `water-splash-pop` 0.2s → 0.1s (splash 절반 길이). modal.css fallback rule + js/components/modal-water-thanks.js 의 inline animation 양쪽 동기화. 시퀀스 전체 8s / 자동 닫기 9.5s 등 다른 시간은 무변경 | (애니메이션 도메인 고유값) |
| **신규 자산** | `video/hero_main.mp4` (6.4MB, hero 비디오 배경) | 향후 mp4 외 webm 등 확장자 후속 추가 검토 |

**하위 호환**
- `#modal-water-support` 시그니처 무변경 — 트리거 진입점만 변경(스크롤 자동 → 종료 화면 버튼)
- 페이지 헤더 BEM 셀렉터 — 옛 `__page-header-side` / `__page-header-center` 제거됨. 4 episode-add 페이지 inline 마크업 변경 필요
- viewer-tate `.viewer-tate__stage` 의 `padding-bottom: 50vh` 제거 — 종료 화면 1뷰포트 자동 노출이 대체
- 기존 `.navbar` / `.btn-glass` / `.btn-ghost` 사용처 무변경 — 새 변형은 별도 클래스로 추가
- `.btn-glass` 기본 동작에 `backdrop-filter` 추가됨 — 기존 사용처는 자연스럽게 frosted 강화

**확인할 곳**
1. `js/pages/viewer-{yoko,koma,tate}.js` — 종료 화면 토글 + 버튼 바인딩
2. `css/components/viewer-end.css` — 컴포넌트 단일 파일
3. `main-home.html` + `css/pages/main-home.css` + `js/pages/main-home.js` — hero 섹션 + parallax + navbar 토글
4. `styleguide.html` — Patterns > Viewer End / Buttons > Ghost Dark / Navbar > On-Dark 데모
5. [`COMPONENTS.md`](./COMPONENTS.md) — `.viewer-end` / `.main-home__hero` / `.navbar--on-dark` / `.btn-ghost-dark`
6. `video/hero_main.mp4` — 신규 자산

---

## 📌 v1.06.6 요약 (2026-04-30, v1.06.5 후속)

**`#modal-water-support` Step 2(thanks) 비주얼 시퀀스 + JS 모듈화 + 자산 정리.** 핵심은 (1) 8s 동안 plant drop 5 + ground drop 20 + 새싹·오버레이 단계 전환 + 타이틀 typewriter type-in/erase + 자동 닫기로 구성된 시퀀스를 `js/components/modal-water-thanks.js` 단일 모듈로 추출, (2) 4 페이지(series-home / viewer-{yoko,koma,tate})의 inline JS ~150줄 × 4 외부화 + DOM 재사용 패턴(cloneNode-replaceWith 제거)으로 메모리·런타임 비용 감소, (3) 미참조 SVG 17개 디스크 삭제 + styleguide 카탈로그 동기화.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **modal-water-thanks.js 모듈 (NEW)** | `WaterThanks.start(thanksModal)` / `WaterThanks.reset(backdrop)` / `WaterThanks.cancel()` 3 함수 노출 IIFE. dropCycleCancels 배열로 모든 setTimeout / animationend 일괄 정리. 4 페이지의 inline 시퀀스 코드 외부화 | React: `<WaterThanksSequence>` — useEffect 안 setTimeout 체인 + 단일 ref array 로 drop/illust/title 제어 |
| **8s 비주얼 시퀀스** | t=0/2/3.5/5/6.5/8s 마다 정렬된 plant drop 착지 + 새싹·오버레이 일러스트 swap (183→184→186→187 + overlay 185→188→189) + 타이틀 typewriter 3단계 + ground drop 20개 taper 분배(t=1~8s) + wet-spot 갈색 타원 + t=9.5s 자동 모달 닫기 | (목업 데이터) — 단계 타임라인 React `useEffect` 로 1:1 재현 가능 |
| **DOM 재사용 패턴** | 매 사이클 `cloneNode-replaceWith` 제거 → 단일 element 에 `style.animation = 'none'` → reflow → inline animation 재할당으로 재시작. 8s 동안 100+ 노드 생성/제거 → 0 (wet-spot 동적 div 만 예외) | React: ref 로 element 보관 + animationName 변경으로 재시작. WAAPI 의 `el.animate(keyframes, opts)` 도 1:1 매핑 가능 |
| **modal.css thanks 키프레임** | `water-drop-fall` 1s ease-in (낙하), `water-splash-pop` 0.2s ease-in (착지 후 src swap + 페이드), `water-wet-spot` 0.8s ease-out (땅 자국 짙어졌다 마름), `water-thanks-typewriter` / `water-thanks-eraser` (clip-path inset 좌→우 / 우→좌) | Tailwind keyframes / animations 등록 |
| **자산 정리** | 미참조 SVG 17개 디스크 삭제: `img_illust_181`, `img_water_drop_177~180`, `img_water_splash_{left,right}` 단일 + a~e 12종. styleguide Spot Illustrations 카탈로그를 새싹 4단계 + 오버레이 3단계 실 사용 자산만 등록. Water Drops 5종 → 1종(176)으로 간소화 | React: 사용 자산 직접 import + Tailwind/SVG 컴포넌트 변환 |

**하위 호환**
- `#modal-water-support` 시그니처(form step) 무변경 — Step 2 진입 동선만 모듈화
- 4 페이지 HTML 마크업 변경 없음(thanks 모달 내부에 `.modal-water-thanks__illust-overlay` 한 줄만 추가)
- modal.css `.modal--water-thanks*` 셀렉터 BEM 구조 유지, `--y-jitter` CSS 변수만 신규

**확인할 곳**
1. `js/components/modal-water-thanks.js` — 시퀀스 SSOT 단일 파일
2. [`COMPONENTS.md`](./COMPONENTS.md) — `.modal--water-thanks` 컴포넌트 항목 (시퀀스·DOM 재사용 패턴·cancel 흐름 명세)
3. `series-home.html` / `viewer-{tate,koma,yoko}.html` — inline JS 가 `WaterThanks.start/reset` 호출 2줄로 축소된 형태
4. `styleguide.html` Spot Illustrations / Water Drop / Water Splash 카탈로그 — 실 사용 자산만 노출

---

## 📌 v1.06.5 요약 (2026-04-30, v1.06.4 후속)

**viewer-koma 신규 + viewer 3종 모두에 「水をあげて応援する」 모달 통합 + 응원 댓글 모달(`#modal-support-comments`) 신규 + 모달 백드롭 CSS 변수 추출 + ease-standard 곡선 변경.** 핵심은 (1) 縦/横/コマ 3개 뷰어가 마지막 페이지·스크롤 끝에서 동일 모달을 트리거하는 종료 플로우 완성, (2) creator-series-home / series-manage-detail 의 「応援コメントを見る」 버튼 → 댓글 리스트 모달, (3) 모든 모달 백드롭의 색·투명도·블러를 3개 변수로 일괄 제어.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **viewer-koma.html (NEW)** | コマ 単위 가로 카루셀 뷰어. popup window. 1008 고정 폭 카드 안에서 두 이미지가 트랙에 붙어 함께 슬라이드(0.6s ease-standard, fade·delay 없음). 6 dot 인디케이터 + 캡션. 좌/우 nav 80px 폭 + 카드 높이 자동 매칭. 마지막 코마 next 클릭 → `#modal-water-support`. 신규 JS `js/pages/viewer-koma.js`, CSS `css/pages/viewer-koma.css` | React: `<ViewerKoma>` — 트랙 transform pattern (clone + insertBefore/append) |
| **viewer 3종 종료 모달 통합** | yoko / koma / tate 모두에 `#modal-water-support` 모달(감정 라디오 4 + textarea + 풋터 「次の話を読む」/「水をあげて応援する」). yoko/koma 는 마지막 페이지 next 클릭, tate 는 스크롤 끝 도달 시 자동 오픈. textarea placeholder 두 줄 (`応援メッセージを入力せずに水やりをすると、\nランダムメッセージが届きます。`) | React: `<WaterSupportModal>` 단일 컴포넌트 + 트리거 위치만 페이지별 분기 (현재 inline script 가 3중복 — 후속 작업으로 모듈 추출 예정 → v1.06.6 에서 처리 완료) |
| **viewer-tate 재오픈 로직** | 스크롤 끝 1차 도달 시 자동 오픈. 모달 닫은 뒤 끝에서 50vh 이상 위로 스크롤 후 다시 끝 도달해야만 재오픈. MutationObserver 로 backdrop class 감시 | React: scroll observer hook + 50vh threshold flag |
| **viewer-tate 마지막 50vh 패딩** | `.viewer-tate__stage` 하단 패딩 50vh — 마지막 이미지의 하단이 뷰포트 50% 위치에 머물도록 | (단순 padding) |
| **viewer-yoko / koma 듀레이션 통일** | yoko 슬라이드 0.3s (퇴장 50% 시점에 입장 시작) / koma 트랙 슬라이드 0.6s | 토큰 변경 |
| **#modal-support-comments (NEW)** | creator-series-home / series-manage-detail 의 「応援コメントを見る」 버튼 트리거. 504×644 모달 + 댓글 15개 리스트(스크롤). 행: thumb 65×48 + body(text 13/20 + meta 50% 반투명 + reactions pill 2개) | React: `<SupportCommentModal>` + `<SupportComment>` 행 컴포넌트 |
| **support-comment.css (NEW)** | `.support-comment-list` / `.support-comment` / `.support-comment__thumb/body/text/meta/name/sep/date/reactions/pill` BEM 일습 + `.modal:has(.support-comment-list)::after` 그라디언트 페이드 아웃(40h, modal 하단 radius 보존) | shadcn 매핑: 각 sub 클래스를 React 컴포넌트로 1:1 분해 |
| **modal-backdrop CSS 변수 추출** | `.modal-backdrop` 에 `--modal-backdrop-base` (`var(--color-bg-soft)`) / `--modal-backdrop-alpha` (50%) / `--modal-backdrop-blur` (20px) 3종 변수. `:root` 또는 페이지 단위에서 일괄 변경 가능. blur 기본값 8 → 20 변경 | Tailwind: `backdropBlur` extend 또는 inline arbitrary value |
| **modal step 1 그라디언트** | modal-context Step 1(작품 선택 리스트)도 Step 2 와 동일한 하단 40h 흰색 그라디언트 페이드 아웃. `.modal__step:has(.modal__list)::after`. 하단 padding 40 추가. 양쪽 모두 모달 하단 radius 20 보존 | (시각 개선만) |
| **--ease-standard 곡선 변경** | `cubic-bezier(.4, 0, .1, 1)` → `cubic-bezier(.5, 0, 0, 1)`. 더 부드러운 진입·강조된 마무리. accordion / right-panel / workspace-onboarding chrome 토글 / viewer-koma 슬라이드 등 모든 사용처에 자동 반영 | Tailwind preset / design-tokens.json 동기화 완료 |
| **viewer-yoko 마지막 장 nav 동작** | nextBtn 마지막 장에서도 disabled 시키지 않음 + 클릭 시 모달 트리거. 슬라이드 중 클릭은 `animating` 가드(disabled 토글 안 함 → Hover 시각 유지) | (페이지별 동작) |
| **응원 메시지 랜덤화** | creator-series-home / series-manage-detail 의 댓글 15개 — 짧음/중간/긴 문장 + 다양한 닉네임(さくら✿ / haru / mio / yuki / taro / hana / ren / sou / mei / kei / nao / riko / sho / akira) | (목업 데이터) |

**하위 호환**
- 기존 `.modal-backdrop` 사용처 무변경 — 변수 미정의 시 기본값(20% blur, 50% alpha)으로 동작
- 기존 `.modal__step` / `.modal__field` 시그니처 무변경, 그라디언트는 추가만
- `--ease-standard` 곡선만 변경, 다른 토큰·BEM 구조 변경 없음

**확인할 곳**
1. [`COMPONENTS.md`](./COMPONENTS.md) — 페이지 스코프 컴포넌트 섹션 갱신: `.viewer-tate / .viewer-yoko / .viewer-koma` 3종 통합 명세 + `.support-comment*` + `.modal-backdrop` 변수 + `.modal__step:has(.modal__list)::after`
2. `viewer-koma.html` — 신규 카루셀 뷰어
3. `creator-series-home.html` / `series-manage-detail.html` — 댓글 모달
4. `styleguide.html` — `--ease-standard` 갱신 곡선 표시

---

## 📌 v1.06.4 요약 (2026-04-30, v1.06.3 후속)

**series-manage-detail / author-profile / viewer-tate 신규 페이지 3종 + compact 변형 3종(garden / garden-card / reaction-bar) + 토큰 추가(--space-0_75, --ease-in/--ease-out, .text-link 유틸) + viewer-yoko 슬라이드 개선 + 페이지 패턴 통일.** 핵심은 (1) 작품 관리 흐름 페이지(series-manage-detail) 신설로 series-post-management → series-manage-detail → episode-add-yoko 동선 완성, (2) 작가 프로필(author-profile) 신설 + series-card / garden-sign 의 작가명 텍스트 링크화, (3) 縦読み 뷰어(viewer-tate) + 横読み(viewer-yoko) spread 동시 슬라이드 개선.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **series-manage-detail.html (NEW)** | workspace shell 안에서 series-card / garden-card / episode-card 3카드를 fluid 720(`max(--p50, 50vw)`) 폭으로 노출. radius 16(페이지 전용 override). 12개 에피소드 행 | React: `<SeriesManageDetail>` — 3 카드 슬롯 합성 |
| **author-profile.html (NEW)** | navbar-only 페이지. 1008 inner — 프로필 카드(avatar 140 + 이름·소개·SNS pill 2개) + 투고 작품 그리드(work-card × 5, cover 160×228 + 메타·통계). 海野ハル / つちだ かほ 클릭 시 진입 | React: `<AuthorProfile>` — 카드 2종 + work-card 컴포넌트로 분해. work-card 컴포넌트 승격 검토 |
| **viewer-tate.html (NEW)** | 縦読み(세로 스크롤) 만화 뷰어. popup window. 728px 고정 폭 이미지 5장 세로 나열 + 스크롤 위치 → progress bar + 탭 시 chrome 토글 | React: `<ViewerTate>` — 이미지 배열 + scroll progress hook |
| **compact 변형 3종 (NEW)** | `.garden-card--compact` 720×370, padding 0/28, justify-center / `.garden--compact` 633×207, item 68×76 (+ `.garden-sign` 동반 축소) / `.reaction-bar--compact` 664×65.6 (Figma 0.8× 환산) — series-manage-detail 페이지에서 사용 | React: size prop 분기 (`<GardenCard size="compact" />`) |
| **신규 토큰** | `--space-0_75: 3px` (compact gap), `--ease-in: cubic-bezier(.4, 0, 1, 1)` (퇴장), `--ease-out: cubic-bezier(0, 0, .2, 1)` (등장) | Tailwind preset 동기화 필요 |
| **.text-link 유틸리티** | `css/tokens/typography.css` — 색·폰트 부모 inherit + Hover/focus-visible 시 underline. 작가명 텍스트 링크용 | React: 단순 `<a>` + 동일 동작 |
| **viewer-yoko 슬라이드 개선** | spread 동시 슬라이드, 퇴장 50% 시점에 입장 시작(0.6s, ease-in/out 분리), 페이지 패리티 따라 이미지 src 교체 | React: framer-motion `AnimatePresence` 로 단순화 가능 |
| **페이지 패턴 통일** | mypage / reader-account-setting 의 `margin-top + calc(100vh - navbar)` → `padding-top: var(--navbar-height) + min-height: 100%` (series-home 패턴) | (개발 영향 없음) |
| **랜딩 연동 추가** | series-post-management `編集・話を追加` → series-manage-detail / series-manage-detail `作品情報を編集` → series-edit / `エピソード追加` 및 행 `編集` → episode-add-yoko / 海野ハル 작가명 → author-profile | (개발 영향 없음) |

**하위 호환** — 기존 `.garden-card` / `.garden` / `.reaction-bar` 시그니처 무변경(`--compact` 추가만), mypage / reader-account-setting 시각 무변화(구조만 통일).

**확인할 곳**
1. [`COMPONENTS.md`](./COMPONENTS.md) — compact 변형 메모, 페이지 스코프 컴포넌트(`.author-profile-card` / `.author-profile-works` / `.work-card` / 뷰어) 신규 섹션
2. `series-manage-detail.html` / `author-profile.html` / `viewer-tate.html` — 3종 신규 페이지
3. `styleguide.html` — `.text-link` (Typography), `--space-0_75` / `--ease-in` / `--ease-out` (Layout) 등록 확인

---

## 📌 v1.06.3 요약 (2026-04-29, v1.06.2 후속)

**modal-context 모듈화 (정적 HTML → 데이터 기반 렌더) + workroom mini 모드 작업 종료 모달 추가 + 새 modal sub-elements (field/add-slot/entity-row).** 핵심은 (1) 모달 컨텍스트 마크업을 PageAttachment 와 동일한 패턴(JS 모듈 + init 옵션 + 콜백)으로 통합, (2) workroom 미니 팝업 종료 시 띄우는 축하 모달(`modal--work-end`) 신규 + 일러스트 3종 등록, (3) Step 2 의 빈/채워짐 상태를 데이터로 자동 분기하는 신규 sub-element 일습.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **modal-context 모듈 리팩토링** | `js/components/modal-context.js` (CHANGED) — 정적 HTML 주입 → `ModalContext.init({ works, selectedWorkId, story, characters, onSelectWork, onSaveStory, onSaveCharacter, onDeleteCharacter })` 데이터 기반 렌더. 빈/채워짐 상태 자동 분기 (story=null → add-slot / characters.length===0 → add-slot). 순수 함수 `_internal` (isStoryEmpty/hasCharacters/nextCharacterId/findWork/findCharacter) 노출. 자동 시동 시 빈 상태로 시작, 데모용 `kitchen` 작품 선택 시 채워진 sample state 표시 | React: `<ModalContext>` props 1:1 매핑. 콜백→상태 갱신 패턴 그대로 React state hook 으로 이식 |
| **modal--work-end 신규 variant** | `css/components/modal.css` + `workroom.html` (CHANGED) — workroom mini 모드 우상단 「作業終了」 버튼이 `#modal-work-end` 트리거. 폭 400 / padding 48 28 32 / gap 36 / 가운데 정렬. 일러스트(240×146) + 제목(22/32 w6) + 서브 + 좌/우 1px gray-5 divider + 가운데 텍스트 + 액션 stack(filled-black + line). 두 액션 모두 `window.close()` (popup window 자체 닫음) | React: `<WorkEndDialog />` (modal--work-end, 정적). illustration prop 으로 variant a/b/c 선택 |
| **새 modal sub-elements** | `css/components/modal.css` (CHANGED) — Step 2 의 단일/리스트 필드용 `.modal__field` / `.modal__field__list`, 항목 행 `.modal__entity-row` (+ `__heading` `__desc`), 빈 슬롯 `.modal__add-slot` (40h · gray-4 dashed outline · radius-btn · 18×18 gray-2 add icon · hover bg gray-6+black icon · pressed scale 0.97 · focus ring) · 마지막 field 자동 flex:1 + 내부 list overflow-y:auto + padding-bottom 40 + 하단 흰색 그라디언트(::after) | React: 각 sub 컴포넌트(`<EntityRow>` `<AddSlot>` 등)로 분리. fade-out 그라디언트 그대로 |
| **modal.js goto 핸들러 확장** | `js/components/modal.js` (CHANGED) — `[data-modal-goto="N"]` 클릭 시 `data-tab-target` 동반되면 해당 panel 자동 노출 (탭 UI 없어도 panel `hidden` 토글). step 3 에서 character/story 패널 분기에 활용 | React: 단일 컴포넌트 안 if-else 분기로 단순화 |
| **이미지 3종 추가** | `img/img_workroom_congrats_{a,b,c}@2x.png` (NEW · 480×292) — workroom 포모도로 완료 축하 일러스트. styleguide Images 섹션 등록 | React: `<img>` 그대로 또는 next/image. variant prop 노출 |
| **episode-add 4종 페이지 보완** | `radio-card.css` 링크 누락 fix — 모달 step 1 작품 카드 정상 렌더 | (개발 영향 없음 — link 누락 보정) |
| **버전 갱신** | v1.06.3 (`index.html` + `styleguide.html` 헤더 라벨) | (개발 영향 없음) |

**하위 호환**
- `#modal-context` 자동 시동 — 페이지에서 init() 호출 안 해도 빈 상태로 자동 시동, 9개 페이지 변경 없이 동작
- 기존 modal sub-element (`modal__title`/`__list`/`__footer`/`__field-group`/`__field-row`) 시그니처 무변경
- 새 sub-element 는 추가만, 기존 마크업 영향 없음

**확인할 곳**
1. [`COMPONENTS.md`](./COMPONENTS.md) `.modal` + `.modal--work-end` + `#modal-context` 섹션 — **API + sub-element 명세**
2. `js/components/modal-context.js` — Public API + `_internal` 순수 함수 + React 청사진
3. `workroom.html` mini 모드 (`?mode=mini`) — 우상단 「作業終了」 → `#modal-work-end`

---

## 📌 v1.06.2 요약 (2026-04-29, v1.06.1 후속)

**episode-add 4 변형 페이지(yoko/koma/tate/episode-add) + PageAttachment JS 모듈 + page-koma-grid 컴포넌트.** 핵심은 (1) 페이지 이미지 첨부 + 드래그&드롭 재정렬 로직을 단일 JS 모듈로 추출, (2) 코마/타테 작품 전용 그리드(`page-koma-grid`)를 cols 옵션으로 분기, (3) 가상 백지 페이지(左始まり) + 박스 사이 boundary 핸들 + upload-zone drop 제외 등 인터랙션 정교화.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **PageAttachment JS 모듈** | `js/components/page-attachment.js` (NEW) — 페이지 이미지 첨부 영역의 모든 로직(empty↔grid 토글 / spread 페어링 / drag&drop / 가상 백지 / 파일 검증) 캡슐화. `init()` + `onChange/onError` 콜백 API. 4개 episode-add 변형 페이지에서 단일 init 호출로 사용 | React: `<PageAttachment files onChange leftStart maxFiles cols layout />` 컴포넌트로 이식. 순수 함수(`buildDisplayItems`/`buildSpreads`/`moveFile`/`validateFile`)는 그대로 reuse |
| **page-koma-grid 컴포넌트** | `css/components/page-koma-grid.css` (NEW) — コマ(panel)/タテ읽기 작품용 그리드 래퍼. cols 옵션으로 5(コマ)/1(タテ)/9 등 자유 분기. 셀은 `page-spread-preview` 그대로 재사용 (1-page mode) | React: `<PageKomaGrid cols={5} />`. 셀 컴포넌트 재사용으로 매핑 단순 |
| **신규 페이지 3종** | `episode-add-yoko.html` / `episode-add-koma.html` / `episode-add-tate.html` — 각각 가로/コマ/タテ 읽기 모드별 에피소드 등록 페이지. PageAttachment 모듈 + 폼 단 검증만 페이지에서 처리 | React 라우팅: `/episode/add/[mode]` 단일 컴포넌트 + mode prop 분기 가능 |
| **인터랙션 정교화** | (1) 가상 백지 페이지(`__page--blank`) — 左始まり 모드 시 첫 spread 1번 자리에 점선 outline + "白紙ページ" 라벨 표시 (files[] 변경 없이 render 단 prepend). (2) 박스 사이 boundary 핸들 — drag indicator 가 인접 셀 outline 1px 영역 정중앙(-1.5px)에 위치. (3) upload-zone drop 제외 — 첨부 박스는 drag target 에서 무시 | React: 동일 구현. 가상 백지는 `displayItems.unshift({blank:true})` 패턴 |
| **그리드 outline 정리** | `.page-spread-grid` / `.page-koma-grid` 의 wrapper 자체 outline/radius/overflow 제거. 셀끼리 `margin:-1px` 로 1px outline 공유 + 코너 셀의 자체 `border-radius` 로 외곽 라운딩 처리 | (개발 영향 미미 — 동일 시각, 더 단순한 CSS) |
| **upload-zone min-height 240** | `.page-upload-zone { min-height: 240px }` — 단독/빈 행 케이스 보장. 그리드 안에서 형제 spread 가 더 크면 row stretch 로 그쪽에 자동 일치 | Tailwind: `min-h-[240px]` 직접 매핑 |
| **인덱스 갱신** | `index.html` 4개 페이지 등록 + `styleguide.html` Page Koma Grid 섹션 추가 + 버전 v1.06.2 | (개발 영향 없음) |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- v1.06.0/1 의 페이지(`page-spread-grid`, `page-spread-preview`, `page-upload-zone`) 시그니처 유지 — wrapper outline 제거 등 시각 무변화
- PageAttachment 모듈은 추가만, 기존 페이지 인라인 IIFE 를 모듈 호출로 대체

**확인할 곳**
1. [`COMPONENTS.md`](./COMPONENTS.md) `page-koma-grid` + `### JS 모듈: PageAttachment` 섹션 — **API + React 청사진**
2. `js/components/page-attachment.js` — 단일 진입점, 순수 함수 + init() 캡슐화
3. `episode-add-{yoko,koma,tate}.html` — 페이지별 init 옵션 차이 (layout/cols/leftStart)

---

## 📌 v1.06.0 요약 (2026-04-29, v1.05.9 후속)

**floating-alert / emotion-pick 신규 + 글로벌 base 룰 통합 + fluid 너비 패턴 확장.** 신규 페이지 0개, 신규 CSS 컴포넌트 2개. 핵심은 (1) 액션 포함 떠있는 에러 배너 컴포넌트 신규, (2) 水やり 모달용 감정 선택 라디오 신규, (3) box-sizing/font-family 를 typography.css 에 단일 선언으로 통합해 ~80개 중복 룰 제거.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **floating-alert 컴포넌트** | `css/components/floating-alert.css` (NEW) — 페이지·모달 위 떠있는 액션 포함 에러 배너. inline-alert 와 달리 우측 액션 버튼 슬롯 포함. dismiss 패턴: CTA 클릭 → `is-dismissing` → opacity/translateY transition → `transitionend` 에서 remove. transitionend 는 `e.target === ref && e.propertyName === 'opacity'` 로 필터해 내부 버튼 hover transition 무시 | React: `<FloatingAlert variant="error" action={...} onDismiss={...} />`. transitionend 필터 패턴 그대로 이식 |
| **emotion-pick 컴포넌트** | `css/components/emotion-pick.css` (NEW) — 水やり 모달의 감정 선택 라디오. 80×auto · 36×36 mask icon + 12/18 라벨 · 5 states(default/hover/focus/pressed/selected). `<label>` + 숨겨진 `<input type="radio">` (radio-card 계열) | React: shadcn `RadioGroupItem` 기반 + 커스텀 레이아웃. selected 시 icon = sky-3, label = 600 |
| **글로벌 base 룰 통합** | `css/tokens/typography.css` 에 `*, *::before, *::after { box-sizing: border-box }` + `button, input, textarea, select { font-family: inherit }` 단일 선언. ~44개 component CSS 의 box-sizing 중복 + ~46개 파일의 개별 font-family 선언 제거 | Tailwind preflight 가 동일하게 처리하므로 이식 시 추가 작업 불필요 |
| **Fluid 너비 패턴 확장** | `width: max(var(--p50), 50vw)` (최소 720px, 1440 초과 시 0.5x 성장) 을 `form-card` / `post-manage` / `empty-state` / `account-setting` 페이지에 일괄 적용. floating-alert 는 `left: max(50%, var(--p50))` + `translateX(-50%)` 로 1440 이하에서 페이지 중심(720)에 락 | Tailwind 임의값 `w-[max(var(--p50),50vw)]` 또는 preset 커스텀 util 로 매핑. `creative-partner-onboarding` 만 의도적으로 제외 |
| **토큰·spacing 미세 조정** | `form-field` gap 6 → 8 / `my-msg__text` `white-space: pre-wrap` (shift+enter 개행 보존) / `styleguide.css` 12건 하드코딩 색상 → `--sg-*` 토큰화 (신규 7종) | (개발 영향 미미 — Tailwind preset 갱신 불필요) |
| **아이콘 추가** | `.icon-close-thin` (NEW · 24×24) + `.icon--lg` size modifier (24px). `.icon-fast-forward-filled` mask path 라운드 보강 | `ICONS.md` 에 매핑 반영 — `X` (lucide) `strokeWidth={1.5}` 로 thin 처리 |
| **페이지 보정** | `workspace-onboarding.html` 의 `my-msg.css` `<link>` 누락 추가(채팅 말풍선 회귀 수정), `viewer-yoko.html` 의 `_global.js` 를 head 로 이동 | (개발 영향 없음) |
| **인덱스 갱신** | `index.html` + `styleguide.html` 버전 라벨 v1.06.0 | (개발 영향 없음) |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- 신규 CSS 컴포넌트 2개(`floating-alert`, `emotion-pick`) — 추가만, 기존 컴포넌트 시그니처 무변경
- 글로벌 base 룰 통합은 시각/동작 변화 없음 (단순 중복 제거)

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.06.0 항목 — **개발 액션 요약**
2. `css/components/floating-alert.css` + `series-register.html` inline `<script>` (dismiss 패턴)
3. `css/components/emotion-pick.css` + 모달 사용 예시
4. `css/tokens/typography.css` — 글로벌 reset 통합 영역

---

## 파일 안내

### 디자인 → 개발 매핑
| 파일 | 용도 | 대상 |
|---|---|---|
| [`design-tokens.json`](./design-tokens.json) | 모든 디자인 토큰 (color/spacing/typography/shadow/radius) | 참고용 원본 |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Tailwind `theme.extend` 프리셋 | `tailwind.config.ts`에 직접 import |
| [`COMPONENTS.md`](./COMPONENTS.md) | 60개 CSS 컴포넌트 + 2개 JS 모듈(PageAttachment, ModalContext) → shadcn 매핑 + variant/size/state | cva 정의 작성 시 |
| [`ICONS.md`](./ICONS.md) | 57개 아이콘 → lucide-react 매핑 | 아이콘 치환 시 |

### 개발 문서
| 파일 | 용도 |
|---|---|
| [`GETTING_STARTED.md`](./GETTING_STARTED.md) | 로컬 실행 + Tailwind 연결 + 구현 우선순위 |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 프로젝트 구조, 로딩 순서, 확장 포인트 |
| [`CONVENTIONS.md`](./CONVENTIONS.md) | BEM·토큰·HTML·JS 네이밍과 패턴 |
| [`CHANGELOG.md`](./CHANGELOG.md) | 변경 이력 (디자인 동기화 시점 파악) |
| [`MIGRATION.md`](./MIGRATION.md) | v1.03 → v1.04 브리지 (이전 핸드오프 수신자용 · 신규 개발자는 스킵 가능) |

## 시작하기 (개발자)

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
```

```ts
// tailwind.config.ts
import funfanPreset from './path/to/handoff/tailwind-preset';

export default {
  presets: [funfanPreset],
  content: ['./src/**/*.{ts,tsx}'],
};
```

## 레퍼런스 (살아있는 문서)

세부 스펙이 다르거나 의심스러울 땐 **프로토타입 저장소의 실제 페이지**를 확인:

- `styleguide.html` — 모든 컴포넌트의 variant/size/state 렌더
- `workspace.html`, `workroom.html`, `workspace-onboarding.html` — 실제 사용 예
- `css/components/*.css` — BEM 네이밍, states, 애니메이션 원본
- `js/core/keyboard-focus.js` + `js/components/chat.js` — 공용 인터랙션 로직
- `CLAUDE.md` — 디자인 원칙 (1440px 최소 너비, focus ring 규칙, 토큰 사용 규칙)

프로토타입은 **계속 진화 중**이므로 이 핸드오프 자료가 현행과 다를 수 있습니다.
의심 시 저장소 원본이 진실.

## 핵심 원칙 (꼭 지켜야 할 것)

1. **최소 너비 1440px** — 반응형 축소 금지
2. **focus ring은 키보드 전용** — 마우스 클릭 시 절대 금지 (`body.using-mouse` 또는 `:focus-visible`)
3. **디자인 토큰만 사용** — 하드코딩 px·rgba 금지
4. **icon-only 버튼은 반드시 `aria-label`**

## 업데이트 정책

- **토큰 추가/변경**: 디자인팀이 `design-tokens.json`·`tailwind-preset.ts` 동기화 후 공유
- **새 컴포넌트**: `COMPONENTS.md`에 추가 후 공유
- **아이콘 추가**: `icons/` 에 SVG 추가 → `node scripts/build-icons.js` 실행 → `ICONS.md`에 매핑 추가 후 공유

## 개발자 읽는 순서 (권장)

1. `GETTING_STARTED.md` — 로컬 실행 + Tailwind preset 연결
2. `styleguide.html` — 브라우저로 열어 실제 컴포넌트 상태 확인
3. `ARCHITECTURE.md` + `CONVENTIONS.md` — 구조·네이밍·금지사항
4. `COMPONENTS.md` + `ICONS.md` — cva / lucide 매핑 작성
5. `CHANGELOG.md` — 이후 동기화 받을 때마다 최신 항목 확인

## 문의

디자인 프로토타입 저장소에 이슈 작성.
