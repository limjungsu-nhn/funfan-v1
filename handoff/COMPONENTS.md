# FunFan v1.0 — 컴포넌트 → shadcn 매핑 시트

이 문서는 디자인 프로토타입(`css/components/*.css`)의 각 컴포넌트가
**shadcn/ui 어떤 베이스 위에서 어떻게 커스터마이징되어야 하는지**를 정의합니다.

- **Source of truth**: `css/components/` 원본 + `styleguide.html` 렌더 결과
- **치수·색상 세부는 문서 대신 styleguide.html 확인 권장** (진화 중)
- **변형(variant)·상태(state) 체계는 여기서 확정**

---

## 공통 규칙

1. **최소 너비 1440px** — 반응형 축소 금지, 미만 뷰포트는 가로 스크롤
2. **focus ring은 키보드 전용** — `body.using-mouse` 패턴 또는 `:focus-visible`만 사용
3. **색상/간격 토큰만 사용** — 하드코딩 금지 (tailwind-preset.ts 참조)
4. **icon-only 버튼은 필수 aria-label**
5. **모든 간격은 `--space-{n}` 또는 `--p{n}`** — 숫자 직접 금지

---

## 컴포넌트 목록

### Foundation 레벨

| 컴포넌트 | shadcn 베이스 | 비고 |
|---|---|---|
| Typography | (없음) | `text-{scale}-{weight}` utility 직접 사용. scale 14종 × weight 2종 = 28개 |
| Icon | `lucide-react` | `ICONS.md` 참조. 현재 31개 사용 |
| Avatar | `Avatar` | 5 사이즈: xs(20) / sm(32) / md(40) / lg(56) / xl(80) · 10+ variant (avatar-01~) |
| Logo | (이미지 only) | `.logo-funfan` 단일 variant |
| Badge | `Badge` | variant: 기본(white 배경 + wood outline) |

---

### 버튼 계열

#### `.btn` → shadcn `Button`
**Variant × Size × State 매트릭스**

| Variant | Class | 기본 배경 | Hover | Pressed | Focus Ring |
|---|---|---|---|---|---|
| Line | `.btn-line` | white | gray-2 outline | scale(.97) | 3px gray-5 |
| Ghost | `.btn-ghost` | transparent | gray-6 bg | scale(.97) | 3px gray-5 |
| Filled Nature | `.btn-filled-nature` | nature-3 | nature-2 | nature-2 + scale(.97) | 3px gray-5 |
| Filled Wood | `.btn-filled-wood` | wood-3 | wood-2 | wood-2 + scale(.97) | 3px gray-5 |
| Filled Sky | `.btn-filled-sky` | sky-3 | sky-2 | sky-2 + scale(.97) | 3px gray-5 |
| Glass | `.btn-glass` | white-50 | white-100 | white-100 + scale(.97) | 3px gray-5 |

**Size**:
- `sm`: min-height 36px, padding `0 12px`, **pressed scale(.95)**
- `md` (기본): min-height 40px, padding `0 16px`, pressed scale(.97)
- `lg`: min-height 48px, padding `0 16px`, pressed scale(.97)

**State Modifiers** (reference만 — 실제 런타임은 `:hover/:active/:focus-visible`):
`--hover` / `--focus` / `--pressed` / `--disabled`

**아이콘 배치 케이스**: icon + text / text + icon / text only / icon only

**shadcn 구현 예시** (cva):
```ts
const buttonVariants = cva("...", {
  variants: {
    variant: { line, ghost, 'filled-nature', 'filled-wood', 'filled-sky', glass },
    size: { sm, md, lg }
  },
  defaultVariants: { variant: 'line', size: 'md' }
});
```

---

#### `.icon-btn` → shadcn `Button` (variant=ghost, size=icon)
- 28×28px, border-radius 100px (원형)
- 5 states: default / hover / focus / pressed / disabled
- 용도: chat-input 첨부, task-row 취소 등

#### `.float-btn` → shadcn `Button` (variant=floating)
- 원형, 패널 토글 전용
- 5 states + `is-panel-closed` 상태 토글
- `aria-label` 필수

#### `.send-btn` → 커스텀
- 원형 + nature 컬러, chat 전송 전용
- disabled 상태 포함

#### `.task-save-btn` → 커스텀
- ghost 계열 small button + 아이콘 + 텍스트
- disabled 규칙: **현재 입력이 비어있고 + 저장된 데이터도 없거나 비어있을 때만** 비활성화. 그 외엔 항상 활성화 (저장 후 편집 모드 탈출 보장).
- 편집 ↔ 저장 모드 토글 버튼 겸용 (`保存` ↔ `編集`)

---

### 입력 계열

#### `.checkbox` → shadcn `Checkbox`
**States**: default / hover / focus(3px ring) / pressed / **checked** / disabled
- checked: nature-2 배경 + white 체크
- disabled: gray-6 배경 + gray-5 border

#### `.radio-card` → shadcn `RadioGroup` + `Card` 조합
**States**: default(gray-6 bg) / hover(gray-5) / focus(ring) / pressed / **selected**(white + nature-2 outline) / disabled
- 일반 radio가 아니라 **카드 전체가 클릭 영역**
- 내부에 avatar emoji + 타이틀 + 설명

#### `.chat-input` → shadcn `Textarea` + icon buttons
- Container: `.chat-input__field` (textarea 감싸는 필드)
- Actions: `.chat-input__actions` (첨부/전송)
- Auto-resize: 32px ~ 120px
- `aria-label="AIへのメッセージ"`

#### `.input-wood` → shadcn `Input` (variant=wood)
- wood-5 outline, white-50 배경
- states: default / hover(wood-3) / focus-within(wood-3) / disabled(wood-5)
- focus ring 키보드 전용 (`body:not(.using-mouse)` 패턴)

---

### 레이아웃 계열

#### `.navbar` → 커스텀 `<header>`
- fixed position, z-index 최상위, `min-width: var(--base)` 필수
- 높이 64px (`--navbar-height`)
- 좌: 로고 / 우: 버튼 그룹
- Work Mode 변형: 탭 + 작업종료 버튼 (`.navbar--work-mode`)

#### `.left-panel` → 커스텀
- width 288px (`--p20`)
- 고정 사이드바

#### `.right-panel` → 커스텀
- width 288px (`--p20`)
- **collapsible**: `--collapsed` 상태 + `wrapper--instant` (초기 깜빡임 방지)
- 내부: header · chat area · suggestions · footer(chat-input)

#### `.panel-header` → 커스텀
- 아바타 + 이름 + 서브텍스트 + 옵션 액션

#### `.tab` + `.tab-group` → shadcn `Tabs`
- states: default / hover / **selected** / pressed / focus(ring)
- selected: white bg, black-100 text
- `.tab-group`은 wrapper (gray-6 배경)
- **너비 균등화**: `.tab-group { display: inline-grid; grid-auto-columns: 1fr; }` — 모든 탭이 가장 긴 콘텐츠 기준으로 자동 균등화 (JS 측정 불필요, 탭 개수 무관)

---

### 데이터/카드 계열

#### `.stat-card` → shadcn `Card` (variant=stat)
- 좌: 타이틀 + 설명 / 우: 큰 수치 + 아이콘

#### `.revenue-card` → shadcn `Card` (variant=chart)
- 헤더: 제목 + 월 / 누계
- 바차트 (6칸), CSS `--bar-ratio` 변수로 높이 제어
- 애니메이션: `bar-grow` keyframe, delay 0~0.75s

#### `.water-card` → shadcn `Card` (variant=metric)
- 작은 수치 + 아이콘 1개

#### `.review-item` + `.fan-feed` → 커스텀 리스트
- 아바타 + 댓글 + 이모지 반응 + 메타
- fan-feed는 하단 fade mask 포함

#### `.review-item--episode` → 커스텀 (에피소드 카드 내부 리뷰 아이템)
- 상단행: avatar xs + user-name(subtext-w6) · 우측 좋아요 버튼 (♥ + count assist-w4)
- 중단행: `.review-score`(5 stars × 16) + 작성일(overline-w4) — gap `--space-2`(8px)
- 하단: 리뷰 텍스트(assist-w4)
- 섹션 사이 gap `--space-2` (8px), `align-self: stretch`로 부모 폭에 맞춤
- 좋아요 버튼 `:focus-visible` 키보드 포커스링 포함

#### `.review-score` → 커스텀 (별점 — 5 stars × 16×16)
- 항상 5개 별 렌더, `--filled` 붙은 별만 `--color-star` 채우기 (없으면 `--color-gray-4`)
- 별 1개 16×16, 별 간 gap `--space-1` (4px)
- `<svg>` 직접 사용 · `role="img"` + `aria-label`로 점수 접근성 제공
- review-item--episode 내부 외에도 독립 재사용 가능

#### `.series-card` → shadcn `Card` (variant=series)
- 포스터(우측 208×296) + 콘텐츠(좌측: meta · title · author → 56px gap → desc · badges) 가로 배치
- 설명문 80자 초과 시 자동 말줄임 + 인라인 「もっと見る」 버튼 노출 (`js/components/series-card.js`, `data-full` 속성에 원문 보존)
- 「もっと見る」 클릭 → 전체 텍스트 펼침 + 버튼 라벨 「折りたたむ」 전환, 클릭 시 원상 복귀
- 텍스트 확장 시 카드 높이 자동 성장 (`min-height: 296px`), top/bottom 블록 사이 gap 56px 고정 유지
- 버튼 focus ring 3px gray-5 (키보드 전용)

#### `.garden-sign` → 커스텀 (garden 아이템)
- 96×108px 나무 표지판. `img/img_signs.png` 배경 위에 유저 이름 3개 오버레이
- 각 이름은 72px 1줄 말줄임(`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)
- 폰트: 11px / 600 / 16px line-height / `var(--color-white-100)`
- `.garden` 컴포넌트의 Row 1 첫 번째 아이템으로 사용

#### `.reaction-bar` → 커스텀 (garden 짝 컴포넌트)
- 928×auto 흰색 바. garden 하단에 배치되어 반응 카운트 + 물주기 CTA 제공
- 좌측 354px: emotion-btn × 5 (gap 20) + 참여자 텍스트 (13px assist)
- 우측 CTA 234×52: `btn btn-filled-sky` 재활용 + 커스텀 shadow `0 1px 2px rgba(0,0,0,0.05)`
- 컨테이너 padding `16px 16px 16px 24px`, border-radius 14px
- 참여자 텍스트 색: `--color-font-secondary` (#6E6E73)

#### `.emotion-btn` → 커스텀 (표시 전용)
- 감정 카운트 표시 (icon + count, inline-flex, gap 4px) — **비-인터랙티브**, `<span>` 등 inline 요소로 사용
- 아이콘 16×16 · 색 `--color-black-50` · 카운트 14px / w4 / lh 22px / `--color-font-primary-black-100`
- 클릭·호버·포커스·selected 상태 없음 (스펙 변경: 2026-04)
- 클래스명은 레거시 호환으로 유지 (`.emotion-btn`, `.emotion-btn__icon`, `.emotion-btn__count`)

#### `.garden` → 커스텀
- 834×241px 가든 씬. `img/bg_garden.png` 배경 위에 꽃+표지판 레이아웃
- 내용은 컨테이너 **최상단부터** 배치 (`padding: 0 45px`, top padding 없음)
- Row 1: `.garden-sign`(96px) + `.garden__item` × 6 (96px), gap 12px → 총 744px (좌우 45px 패딩 내 꽉 채움)
- Row 2: `.garden__item` × 6, gap 12px → 636px, `align-items: center`으로 자동 센터 정렬
- `.garden__item--empty`: `visibility: hidden`으로 빈 슬롯 레이아웃 유지
- 꽃 이미지: `img/img_flower_0N_before.png` / `img/img_flower_0N_after.png` (01~04)

#### `.garden-card` → 커스텀 Card (garden + reaction-bar 조합)
- 1000×auto wood 카드. `.garden` + `.reaction-bar`를 하나의 컨테이너로 묶는 합성 컴포넌트
- 배경 `--color-wood-6` (#F5EFE3), border-radius 24px, shadow `0 4px 8px rgba(0,0,0,0.02), 0 0 1px rgba(0,0,0,0.10)`
- padding `48px 36px 36px 36px`, flex-column gap 40px, 자식 중앙정렬 (`align-items: center`)
- 자식 폭은 각자 유지 (garden 834 / reaction-bar 928) — 카드는 시각적 프레임만 제공
- Figma: Frame2087333123

#### `.episode-header` → 커스텀 (에피소드 리스트 헤더)
- 1000×auto 흰색 헤더 (garden-card 폭과 일치). 좌측 타이틀 + 전체 수, 우측 정렬 토글
- 좌측 `__title-group` (gap 12): `__title` (20/600/28) + `__meta` (14/400/22 · `--color-font-primary-black-50`)
- 우측 `__sort` 버튼 (gap 4): `__sort-icon` (swap_vert, 18×18) + `__sort-label` (13/400/20)
- `space-between` 레이아웃, 배경 `--color-white-100`
- 정렬 토글 동작은 `.episode-card` 컨텍스트 안에서만 구현됨 (`js/components/episode-card.js`) — standalone 헤더는 라벨만 표시
- 추가 타이포: `--font-size-body-xl: 20px` / `--line-height-body-xl: 28px` + `.text-body-xl-w4/w6`
- Figma: Frame2087333211

#### `.episode-item` → 커스텀 (에피소드 리스트 아이템, `<a>` 링크)
- 에피소드 카드 내부 리스트 아이템. 928×auto (garden-card 내부 폭 기준)
- 썸네일 `__thumb`: 120×80 · border-radius 8px · overflow hidden · `object-fit: cover`
- 본문 `__body`: `flex: 1` · column · gap 4 · align-items flex-start
- 타이틀 `__title`: `.text-subtext-w6` (14/600/22) · `--color-font-primary-black-100`
- 날짜 `__date`: `.text-overline-w4` (11/400/16) · `--color-font-primary-black-50`
- 컨테이너 gap: `--space-5` (20px), 배경 `--color-white-100`
- `<a>` 태그 사용 + 키보드 포커스링 (`focus-visible` 시 `box-shadow ring`)
- TODO: 클릭 시 해당 에피소드 상세로 이동
- Figma: Frame2087333324

#### `.episode-card` → 커스텀 (에피소드 헤더 + 리스트 조합 카드)
- 기존 `.episode-header` + `.episode-item` 재활용한 composite 카드. 1000×auto
- white bg · radius 24 · shadow (0 4 8 rgba(0,0,0,0.02), 0 0 1 rgba(0,0,0,0.10))
- padding 40/36 → 내부 콘텐츠 폭 928 (`.episode-item` 폭과 일치)
- 레이아웃: flex-column · gap 32 (헤더↔리스트)
- `__list`: `<ul>` flex-column · gap 16 · list-style none
- 카드 내부 `.episode-header`는 `width: 100%`로 확장 override (기본 1000 고정)
- **정렬 토글** (`js/components/episode-card.js`): `.episode-header__sort` 클릭 시 라벨 `古い順 ↔ 新しい順` + `.episode-card__list` 자식 순서 역순 재배치
- Figma: Frame2087333121

---

### 메시지 계열 (AI 채팅)

#### `.chat-msg` → 커스텀
- 상대(AI) 메시지 버블
- `.chat-msg--new` 붙이면 **아바타 spring 애니메이션** 발동 (0.3s)
- 기존 메시지는 애니메이션 없음 (페이지 로드 시)

#### `.my-msg` → 커스텀
- 내 메시지 버블 + SVG tail
- nature 컬러 테마

#### `.msg-bubble` → shadcn `Badge` 또는 커스텀
- suggestion chips 용도
- 클릭 시 textarea에 값 전송

---

### 태스크/메뉴

#### `.task-list` + `.task-row` → 커스텀
- 모드: `.task-list--editing` (편집) / 저장 모드 (`task-list` 클래스만)
- row states: default(empty) / hover / focus / **done**(취소선 + red 체크)
- 편집 모드: `.task-row__btn` = 텍스트 클리어(x), input 활성
- 저장 모드: `.task-row__btn` = 완료 토글(✓), input readonly
  - 빈 행: hover 효과 없음 + `cursor: default`
  - 내용 있는 행: hover 시 체크 버튼 표시
- 모드 토글: `task-list--editing` 클래스가 단일 진실원 (`isEditing()` 헬퍼 권장)
- `aria-label="仕事内容"` 필수

#### `.menu-item` → shadcn `NavigationMenu` 또는 커스텀
- 아이콘 + 라벨 + chevron
- states: default / hover / active / disabled

---

### 오버레이/전용

#### `.task-list-panel` → 커스텀 Drawer
- workroom mini mode에서 우측 슬라이드 인

#### `.timer-display` (workroom 전용) → 커스텀
- Chango 폰트 (외부), SVG turbulence 필터 적용
- 상태 머신: idle / running / paused
- 전환 애니메이션 220ms (fade + scale + max-width collapse)

---

## 인터랙션 공통 동작 (chat.js 참조)

- **채팅 메시지 전송**:
  1. 내 메시지 append (my-msg)
  2. 400ms 딜레이
  3. 상대 메시지 빈 버블 append (chat-msg + chat-msg--new)
  4. 30ms/글자 스트리밍
  5. `onReplyComplete` 콜백
- **Suggestion chip 클릭**: textarea에 값 주입 후 즉시 전송
- **textarea auto-resize**: 32px ~ 120px

## 접근성 체크리스트

- [ ] icon-only 버튼 → `aria-label`
- [ ] chat textarea → `aria-label="AIへのメッセージ"`
- [ ] task-row input → `aria-label="仕事内容"`
- [ ] radio-card → `<label>` 래핑 (이미 프로토타입 적용)
- [ ] focus ring은 Tab 누를 때만 (마우스 클릭은 제거)
- [ ] 상태 전환 시 `aria-live` 고려 (채팅 메시지 등)

---

## 핸드오프 Q&A

**Q. shadcn 기본과 다른 점은?**
A. shadcn Button은 default/secondary/destructive/outline/ghost/link 6종인데,
우리는 **line / ghost / filled-nature / filled-wood / glass** 5종 + sm/md/lg 사이즈.
cva로 재정의 필요.

**Q. 색상은 어떻게 매핑?**
A. `tailwind-preset.ts`의 `colors.nature`·`colors.wood` 그대로 사용.
예: `bg-nature-3 hover:bg-nature-2 text-white-100`

**Q. 1440px 레이아웃은?**
A. 모든 `<body>` 또는 최상위 컨테이너에 `min-w-base` (= 1440px).
`position: fixed` 요소(navbar 등)도 별도로 `min-w-base` 지정.

**Q. 다크모드는?**
A. 현재 프로토타입 **미지원**. 추후 검토.
