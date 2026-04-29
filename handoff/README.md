# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.06.3 요약 (2026-04-29, v1.06.2 후속) — 먼저 이것만 보세요

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
