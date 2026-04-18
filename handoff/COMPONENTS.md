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
    variant: { line, ghost, 'filled-nature', 'filled-wood', glass },
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
- disabled 상태로 저장 가능 여부 표시

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
- 모드: `.task-list--editing` (편집) / `readonly`
- row states: default(empty) / hover / focus / done
- `.task-row__btn`: 삭제 버튼 (x)
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
