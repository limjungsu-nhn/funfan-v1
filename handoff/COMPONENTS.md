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
| Icon | `lucide-react` | `ICONS.md` 참조. 현재 40개 사용 |
| Avatar | `Avatar` | 5 사이즈: xs(20) / sm(32) / md(40) / lg(56) / xl(80) · 10+ variant (avatar-01~) |
| Logo | (이미지 only) | `.logo-funfan` 단일 variant |
| Badge | `Badge` | 5 variants: 기본(white 배경 + gray-5 outline + shadow) / `.badge--nature`(nature-6 배경 + nature-2 텍스트, outline/shadow 없음, min-height 30) / `.badge--status`(nature-6 배경 + nature-2 텍스트, radius 8px, padding 8/4, overline-w4 권장 — 상태 표시용 컴팩트) / `.badge--status-wood`(wood-6 배경 + wood-3 텍스트, status 형제) / `.badge--status-gray`(gray-6 배경 + secondary 텍스트, status 형제 — 예: 非公開) |

---

### 버튼 계열

#### `.btn` → shadcn `Button`
**Variant × Size × State 매트릭스**

| Variant | Class | 기본 배경 | Hover | Pressed | Focus Ring |
|---|---|---|---|---|---|
| Line | `.btn-line` | white | gray-2 outline | scale(.97) | 3px gray-5 |
| Ghost | `.btn-ghost` | transparent | gray-6 bg | scale(.97) | 3px gray-5 |
| Filled Nature | `.btn-filled-nature` | nature-3 | nature-2 | nature-2 + scale(.97) | 3px gray-5 |
| Filled Black | `.btn-filled-black` | black-100 | black-100 | black-100 + scale(.97) | 3px gray-5 |
| Filled Red | `.btn-filled-red` | red-100 | red-100 | red-100 + scale(.97) | 3px gray-5 |
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
    variant: { line, ghost, 'filled-nature', 'filled-black', 'filled-red', 'filled-wood', 'filled-sky', glass },
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
**States**: default(bg-soft + gray-6 outline) / hover(gray-6) / focus(gray-6 + 3px gray-5 ring) / pressed(gray-6 · scale 0.98) / **selected**(white + nature-3 outline) / disabled
- 일반 radio가 아니라 **카드 전체가 클릭 영역**
- 내부에 avatar emoji + 타이틀 + 설명
- **Variant `.radio-card--nav`**: 아바타 없음 + 우측 `.radio-card__chevron` (icon-chevron-right 18px) · `justify-content: space-between` · padding-right 16px

#### `.radio-block` → shadcn `RadioGroup` + 컴팩트 카드
**States**: default(bg-soft + gray-6 outline) / hover(gray-6) / focus(gray-6 + 3px gray-5 ring) / pressed(gray-6 · scale 0.98) / **selected**(white + nature-3 outline + card shadow + check 아이콘 표시) / disabled(bg-soft + gray-3 텍스트)
- 폭 216px 고정 — 사이드바·필터 컬럼용 컴팩트 라디오
- 구조: `__content`(title 12/18 w6 + desc 11/16 w4) + `__check`(icon-check 18px · selected 시에만 visible)
- radio-card(448px, avatar)와 다른 variant — title/desc 멀티라인 + radius-sm(10px)

#### `.post-manage` / `.post-row` → shadcn `Card` + custom list
- 작품(시리즈) 관리 카드 + 행. series-post-management.html 메인 컴포넌트
- 컨테이너 `.post-manage`: 720px(--p50), padding 32/28, radius-md, card shadow, gap 24
- `.post-manage__header`: title(body-lg-w6) + 우측 action 버튼 (btn-filled-black btn--sm `作品を登録する`)
- `.post-manage__list`: gap 16
- `.post-row`: 썸네일 76×108(radius-2xs) + body(title-line + meta) + 우측 edit btn(btn-line btn--sm)
- `.post-row__title-line`: title(body-md-w6) + status badge(badge--status / status-gray / status-wood)
- `.post-row__meta`: 가로 메타 (가로/세로 읽기 · 최종 업데이트), `__meta-sep` 1×10 black-30

#### `.post-card` → shadcn `Card` (Pinterest masonry tile)
- 핀터레스트 스타일 포스트 카드. main-home.html 4-col masonry에서 사용
- 컨테이너 `.post-card`: 322px width, gap 12, `break-inside: avoid` (CSS columns 분할 방지)
- `.post-card__image`: width 100% / height auto (자연 비율), radius-btn(12), 1px gray-6 border
- `.post-card__meta`: padding 0 6, column
- `.post-card__head`: title(caption-w6, ellipsis) + 우측 `.post-card__count` (favorite 16px sky-3 + overline-w6 숫자)
- `.post-card__sub`: caption-w4, black-50, ellipsis

#### `.empty-state` → shadcn `Card` (empty placeholder)
- 데이터 없음 플레이스홀더 카드. series-post-management-empty.html 등 빈 상태 페이지에서 사용
- 720(--p50, 1440의 50%) × 360 (높이만 Figma 고정값)
- bg-soft + gray-4 1px dashed border + radius-md (그림자 없음)
- 중앙 정렬: 액션 버튼(btn-filled-black btn--sm) + `.empty-state__hint`(overline-w4, black-30) — gap 12

#### `.form-card` → shadcn `Card` (form wrapper)
- 헤더 + 바디 구조의 폼 래퍼 카드. series-register.html 메인 컴포넌트
- 컨테이너: 720px(--p50), radius-md, white bg, card shadow
- `.form-card__header`: 80px min-height, padding 0 20px 0 24px, body-lg-w6 타이틀
- `.form-card__body`: padding 0 24px 32px, gap 24 (column)
- `.form-card__fields`: form-field들의 세로 스택 (gap 22)
- `.form-card__actions`: 우측 정렬 액션 버튼 그룹 (gap 6)

#### `.thumbnail-upload` → shadcn custom upload zone
- 썸네일 이미지 업로드 영역. series-register.html 등 작품 등록 폼에서 사용
- 폭 100% (부모 폭 채움) × 높이 280
- bg-soft + gray-4 1px dashed border + radius-sm
- 중앙 정렬: 액션 버튼(btn-line btn--sm `クリックして画像を選択`) + `.thumbnail-upload__hint`(overline-w4, black-50) — gap 12

#### `.page-preview-list` → shadcn custom thumbnail list
- 첨부된 페이지 이미지 미리보기 목록. episode-add.html 업로드 결과 리스트
- 142w × 자동 높이 · white bg · 1px purple-100 (`#8A38F5`) border · radius-xs · padding 20 · gap 20 · column flex
- 아이템(`.page-preview-list__item`): 102×152 · radius 6 · `<button>` 기반 · `__thumb` 가 `object-fit: cover`
- **3-state 모델** — 실제 인터랙션은 `:hover`/`:active` 의사클래스로 작동, 정적 데모용 강제 모디파이어 `--hover`/`--pressed` 도 제공
  - **Default**: 오버레이/아이콘 없음 — 썸네일만 노출
  - **Hover**: 검정 30% 오버레이(`::after`) + 중앙 20×20 흰색 `icon-drag-pan` (`.page-preview-list__icon`) + 우측상단 `__delete` 배지
  - **Pressed**: 검정 30% 오버레이 + 중앙 drag-pan 아이콘 (delete 숨김 — 드래그 중 표현)
- `__delete`: 20×20 · top:4 right:4 · `red-10` bg · radius-xs(4) · 12×12 `red-100` icon-delete (휴지통)

#### `.page-spread-preview` → shadcn custom spread tile
- 좌·우 한 쌍 spread 미리보기. episode-add.html 업로드 결과의 spread 단위 표현
- 224w · column 정렬 · gap 8 · 상단 `__label`(overline-w6) + 하단 `__pages`(row · gap 2)
- `__page`: 102×152 · radius 6
- **3-state 모델** (`__page` 단위) — 실제 인터랙션은 `:hover`/`:active` 의사클래스, 정적 데모용 강제 모디파이어 `--hover`/`--pressed` 도 제공
  - **Default**: 오버레이/drag 아이콘 없음 — 썸네일 + num badge 만 노출
  - **Hover**: 검정 30% 오버레이(`::after`) + 중앙 20×20 흰색 `icon-drag-pan` (`__icon`) + 우측상단 `__delete`
  - **Pressed**: 검정 30% 오버레이 + 중앙 drag-pan (delete 숨김 — 드래그 중 표현)
- `__num`: 페이지 번호 배지(top:8 left:8) · 검정 bg · radius 4 · padding 0/4 · 흰색 10/16 w6 · 항시 노출
- `__delete`: 페이지 단일 삭제 버튼(top:4 right:4) · 20×20 · `red-10` bg · radius-xs(4) · 12×12 `red-100` icon-delete · Hover 에서만 노출 (page-preview-list 와 동일 디자인) · `:active` 시 배경 `red-100` / 아이콘 흰색
- **Drag & Drop 순서 변경** (episode-add.html 한정 동작): 각 `__page` 가 `draggable="true"` · 드래그 중 ghost 는 빈 1×1 요소로 `setDragImage` 처리하여 숨김 · 원본은 `data-dragging="true"` (opacity 0.3) 로 자리에 남아 어디서 출발했는지 표시
  - `__thumb` 에 `pointer-events: none` + `-webkit-user-drag: none` + `user-select: none` — 파일 확장자별 native img drag 동작 차단 (부모 `__page` drag 만 작동)
  - 셀에 좌/중/우 3-zone 인서트 — `data-drop-zone="left|center|right"` 시 `__pages::before` 검정 4px 세로 라인(라인 둥근 처리 radius 2 + 흰색 3px box-shadow 아웃라인 · 이미지 100% 높이) 을 해당 위치(좌측 4 / 중앙 50% / 우측 4)에 표시
  - reading-order index 매핑: right→`start`, center→`start+1`, left→`start+2` · 드롭 = insert-and-shift (이후 페이지들 한 칸씩 뒤로 밀림)
  - upload-zone 에 드롭 시 `files.length` 끝에 추가
- `__pages:has(:only-child)`: 마지막 홀수 페이지 1장만 있는 spread → `justify-content: flex-end` 로 우측(RTL 읽기 시작점)에 정렬, 셀 폭은 2-페이지 시와 동일하게 50% 유지
- `__page--blank`: 좌측 시작(左始まり) 모드에서 첫 spread 1번 자리에 자동 삽입되는 가상 백지 페이지. 점선 outline + "白紙ページ" 라벨 · `pointer-events: none` 으로 hover/drag 비활성. files[] 에는 들어가지 않고 render 단에서만 prepend (실제 이미지 인덱스는 그대로 유지, 시각 페이지 번호만 한 칸씩 밀림)

#### `.page-upload-zone` → shadcn custom upload slot
- `page-spread-preview` 그리드 옆/마지막에 놓이는 추가 업로드 슬롯. episode-add.html 페이지 추가 영역
- 224×208 · bg-soft · outline 1px gray-5 (-1px offset) · column · center · gap 10
- 구조: 액션 버튼(btn-line btn--sm `ページ追加` + icon-folder-open) + `__hint`(overline-w4 · secondary text)

#### `.page-spread-grid` → shadcn custom grid wrapper
- `page-spread-preview` / `page-upload-zone` 를 묶는 그리드 래퍼. episode-add.html 이미지 첨부 후 표시
- 100% 폭 · radius-sm · 1px gray-5 outline (-1px offset) · overflow hidden
- `__row`: flex · **`direction: rtl`** (일본 서비스 — 마크업 순서가 등록 순서, 시각적으론 오른쪽부터 흐름)
- 자식(`page-spread-preview` / `page-upload-zone`)은 grid 내부에서 `flex:1` 로 균등 분할 (자체 폭 224 override) · 내부는 `direction: ltr` 로 복원
- 행/열 셀 outline 은 `-1px` 오프셋으로 인접 셀과 1px 겹쳐 단일 라인처럼 보이게 처리 (`__row + __row { margin-top: -1px }` · `__row > *:not(:first-child) { margin-right: -1px }`)
- `__placeholder`: 행이 3열에 모자랄 때 채우는 빈 셀. `aspect-ratio: 224/208` + `bg-soft` + 1px gray-5 outline (page-upload-zone 동일 외형) · 항상 3열 유지가 원칙
- 셀 비율 유지: `page-spread-preview` / `page-upload-zone` / `__placeholder` 모두 `aspect-ratio: 224/208`, `page-spread-preview__page` 는 `aspect-ratio: 102/152` 로 그리드 폭 변화에 비례 스케일
- **상태 모델 (episode-add.html JS 참고)**: `files: File[]` 단일 source of truth →
  1. `files.length === 0` → `thumbnail-upload`(빈 상태) 노출, grid `[hidden]`
  2. `files.length > 0` → grid 노출, `thumbnail-upload` `[hidden]`. 2장씩 spread 페어링 (1·2 / 3·4 / …) · 마지막 홀수면 1-page spread
  3. cells = `[…spreads, uploadZone]` → 행이 3열 미만이면 `__placeholder` 로 `(3 - cells.length % 3) % 3` 개 채움 → 3개씩 row 로 chunk
  4. `ページ追加` 클릭 시 동일 input 재사용 → `files.push(...picked)` → re-render
  5. 페이지 셀 `__delete` 클릭 → `files.splice(idx, 1)` + `URL.revokeObjectURL` → re-render. 마지막 1장 삭제 시 자동으로 빈 상태 복귀
- **episode-add-yoko.html / episode-add.html** 은 `layout: 'spread'` (기본) — 위 그리드 그대로 사용
- **episode-add-koma.html / episode-add-tate.html** 은 `layout: 'koma'` — `page-koma-grid` 그리드 사용. cols 옵션으로 컬럼 수 분기 (코마=5, 타테=1)
- 박스 사이즈는 콘텐츠(이미지) 높이에 shrink-wrap — `aspect-ratio` 미사용 (위/아래 8 padding 고정, 박스 높이 = 16 + label + gap + image 높이)
- 행 정합: `align-items: stretch` 로 같은 행 셀들이 max 높이로 맞춰지고, `__pages flex:1` 로 핸들 높이가 가장 큰 이미지 기준으로 통일
- 빈 행(spread 없음): 행 `min-height: 240px` + upload-zone `min-height: 240px` 로 기본 240 보장

#### `.page-koma-grid` → shadcn custom panel grid
- コマ読み(panel)/タテ읽기 작품 전용 그리드 래퍼. episode-add-koma.html / episode-add-tate.html 사용
- 100% 폭 · column flex · `__row` 는 LTR flex (cols 별 컬럼 수: 코마=5, 타테=1, 9 등 자유 가변)
- **셀은 `page-spread-preview` 그대로 재사용** — 1-page mode (`__pages` 안 1개 `__page` only-child) · 3-state, drag-pan, delete, num badge 동일
- 업로드 셀(`page-upload-zone`) 동일 재사용 · `__placeholder`: 행이 모자랄 때 빈 셀 (bg-soft + 1px gray-5)
- 인접 셀 `margin-left:-1px` / `margin-top:-1px` 로 1px outline 공유 → 단일 연속 라인. wrapper 자체 outline/radius 미사용 (코너 셀 자체 `border-radius: var(--radius-sm)` 로 외곽 라운딩)
- **`data-cols="N"`** 으로 레이아웃 분기:
  - `data-cols="5"` (기본 코마): 5-col LTR · 박스 가로 배치
  - `data-cols="1"` (タテ): wrapper `width: 33.333%` + `margin-inline: auto` 로 hug + 가운데 정렬, 박스가 위→아래 stack
- **Drag & Drop** (cols 별 분기):
  - 가로 (코마, cols≥2): 셀 단위 left/right 2-zone (`data-drop-zone="left|right"`) · 핸들은 vertical 4px 라인이 박스 사이 boundary 에 표시
  - 세로 (タテ, cols=1): 셀 단위 top/bottom 2-zone (`data-drop-zone="top|bottom"`) · 핸들은 horizontal 4px 라인이 위/아래 boundary 에 표시

---

### JS 모듈: `PageAttachment` (`js/components/page-attachment.js`)

페이지 이미지 첨부 영역의 모든 로직(empty↔grid 토글 / spread 페어링 / drag&drop / 가상 백지 페이지 / 파일 검증)을 캡슐화한 모듈. 4개 episode-add 변형 페이지가 모두 단일 init() 호출로 사용.

**Public API:**
```js
const attachment = PageAttachment.init({
  emptyEl,    // [data-page-empty]    필수
  attachedEl, // [data-page-attached] 필수 — 'spread' 시 .page-spread-grid / 'koma' 시 .page-koma-grid
  inputEl,    // <input type=file>    필수
  layout: 'spread',                   // 'spread'(yoko/episode-add, 2-page 페어링·3-col RTL) | 'koma'(1셀=1이미지·LTR)
  cols: 5,                            // 'koma' layout 한정 — 컬럼 수 (기본 5). 1=タテ세로 적층, 9 등 자유 가변
  leftStart: false,                   // 左始まり 모드 (spread 만 사용 — koma 에선 무시)
  maxFiles: 100,
  maxFileSizeMB: 0,                   // 0 = 비활성 (?? 사용으로 0 도 명시적으로 비활성 의도 보존). 프로덕션 시 2
  acceptedTypes: ['image/jpeg', 'image/png'],
  onChange: (files) => {...},         // 파일 변경 시 (얕은 복사본)
  onError:  ({ code, message }) => {} // code: 'TYPE'|'SIZE'|'COUNT'
});

attachment.getFiles();          // 현재 파일 배열
attachment.setLeftStart(true);  // 左始まり 토글 (즉시 re-render)
attachment.destroy();           // ObjectURL 해제 + 이벤트 해제 + DOM 비우기
```

**드래그&드롭 동작**:
- spread layout: 스프레드 단위 left/center/right 3-zone. 가상 백지(left-start) 가 있는 spread 는 `data-spread-real-count` 로 매핑 보정
- koma layout (cols≥2): 셀 단위 left/right 2-zone (가로)
- koma layout (cols=1): 셀 단위 top/bottom 2-zone (세로)
- **upload-zone 은 drop target 에서 제외** — 드래그 중 첨부 박스(추가 슬롯) 위에서는 핸들 미표시 + 드롭 불가

**순수 함수 (`PageAttachment._internal`)** — 단위 테스트/검증용:
- `buildDisplayItems(files, { leftStart })` — 시각 표시용 displayItems 빌드 (백지 prepend 포함)
- `buildSpreads(displayItems, totalFiles)` — 2장씩 spread 페어링, drop zone 매핑용 `start` 계산
- `moveFile(files, srcIdx, targetIdx)` — insert-and-shift (인덱스 보정 캡슐화)
- `validateFile(file, opts)` — type/size 검증

**React 이식 청사진:**
```tsx
// shadcn/ui 기반 — 내부 컴포넌트는 page-spread-* CSS 그대로 + Tailwind 토큰 매핑
<PageAttachment
  files={files}
  onChange={setFiles}
  leftStart={direction === 'left'}
  maxFiles={100}
  maxFileSizeMB={2}
  acceptedTypes={['image/jpeg', 'image/png']}
  onError={(err) => toast.error(err.message)}
/>

// 내부 구조 (참고):
//   <PageAttachmentEmpty />  — files.length === 0 시
//   <PageSpreadGrid>
//     {spreads.map(spread => <PageSpreadPreview {...spread} />)}
//     <PageUploadZone onPick={...} />
//     {placeholders}
//   </PageSpreadGrid>
//
// 커스텀 훅:
//   useDragReorder(files, onReorder)  — dragstart/over/drop 캡슐화
//   useObjectUrls(files)              — useEffect cleanup 으로 revokeObjectURL
```

**검증 패턴**: 페이지 단에서 `onChange` 받아 폼 단 `validateForm()` 호출 → 投稿する 버튼 활성화 토글. yoko/episode-add: 4-field(title, files, dir, afterword) / koma·tate: 3-field(title, files, afterword).

**페이지별 init 차이 (현행)**:
| 페이지 | layout | cols | 読み始め 라디오 |
|---|---|---|---|
| episode-add.html | spread | — | O (4-field) |
| episode-add-yoko.html | spread | — | O (4-field) |
| episode-add-koma.html | koma | 5 | X (3-field) |
| episode-add-tate.html | koma | 1 | X (3-field) |

#### `.inline-alert` → shadcn `Alert` (variant=destructive 등)
- 인라인 경고/안내 배너. 폼 내부 caution 표시용
- padding 12/8, radius-sm, gap 8 (icon + text)
- **Variants**: `inline-alert--error`(red-10 bg + red-30 outline + red-100 text · icon-error-filled)
- 텍스트: `.inline-alert__text` (overline-w4 권장, flex:1, text-align:center)

#### `.floating-alert` → shadcn `Alert` (action 슬롯 포함)
- 페이지/모달 위에 떠있는 에러 배너. inline-alert 와 달리 액션 버튼(재시도 등) 포함
- min-height 60 · padding `12 12 12 20` · radius 16 · gap 8 · bg white
- shadow: `0 4px 8px shadow-subtle, 0 0 1px shadow-mid` (modal 과 동일)
- 너비는 페이지에서 부여 (예: 834px)
- 구조: `.floating-alert__content` (flex:1 · gap 10 · icon 20 + text) + 우측 액션 버튼 슬롯
- **Variants**: `floating-alert--error`(outline 1px red-100 · icon = red-100 · text = red-text · CTA = btn-filled-red btn--sm)
- 텍스트: `.floating-alert__text` (assist 13/20 w4 권장, flex:1, text-align:left)

#### `.radio-list` → shadcn `RadioGroup` + 리스트 아이템
**States**: default(bg-soft) / hover(gray-6) / focus(gray-6 + 3px gray-5 ring · 키보드 전용) / pressed(gray-6 · scale 0.98) / **selected**(white bg + nature-3 outline + shadow-subtle/mid · letter avatar black/white · 텍스트 w6 · 우측 check 표시)
- 라디오 카드의 콤팩트 1줄 변형. min-height 48px · padding 12/20/16
- 구조: `__avatar` (24px letter circle) + `__text` (한 줄 ellipsis) + `__check` (icon-check 18px · 선택 시 opacity 0→1)
- `:has(.radio-list__input:checked)`로 selected 상태 자동 적용 — `.radio-list--selected` 강제 클래스도 지원

#### `.modal` / `.modal-backdrop` → shadcn `Dialog`
- **Backdrop**: `position: fixed` · `top: 64px` (navbar 제외 · navbar z-index 100 위에 오버레이) · `bg-soft 50%` · z-index 1000 · `.modal-backdrop--open`로 display flex 토글
- **Container**: 504px · padding 40px 28px · `--radius-lg`(20px) · `shadow-subtle + shadow-mid` · gap 24px column
- **Sub-elements**: `.modal__title` (body-lg 600) · `.modal__section` (label+list 묶음, gap 6px) · `.modal__label` (caption 600) · `.modal__list` (radio-card 등) · `.modal__footer` (우측 정렬 액션, gap 6px)
- **동작 (`js/components/modal.js`)**: `[data-modal-open="#id"]` 트리거 / `[data-modal-close]` 내부 닫기 / ESC / backdrop 클릭 / body scroll lock / 열림 시 첫 focusable 자동 focus
- 접근성: `role="dialog"` · `aria-modal="true"` · `aria-labelledby` 필수
- TODO: 포커스 트랩 완전 구현 (현재는 첫 focusable 포커스만)

#### `.seed-ceremony` (種を植える儀式 모달 콘텐츠) → 커스텀 풀스크린 일러스트레이티드 다이얼로그
- **사용 페이지**: series-register.html — `#modal-series-register-confirm` 의 backdrop 자식으로 직접 배치 (`登録する` 버튼 클릭 시 오픈)
- **목적**: 작품 등록 직전, "이 이야기에 담고 싶은 마음을 한마디" 입력 받는 의식 인터랙션 (씨앗을 심는 메타포)
- **구조**: 애니메이션 시퀀스가 backdrop 전체를 캔버스로 사용하므로 표준 `.modal` 래퍼 미사용. 모든 자식이 `position: fixed` + viewport 좌표로 직접 배치
- **로컬 토큰 (modal-backdrop 스코프)**: `--seed-ease` · `--seed-dur-slide: 900ms` · `--seed-dur-fade: 600ms` · `--seed-dur-fade-long: 700ms`
- **Sub-elements** (z-order 순):
  - `.seed-ceremony__scene` — 흙바닥 배경 단일 SVG (`img/img_seed_ceremony.svg`, 1920×1080)
  - `.seed-ceremony__soil-hole` — 구덩이 SVG
  - `.seed-ceremony__seed--01/02/03` — 씨앗 3종 (CSS keyframes 부유 → 의식 시작 시 WAAPI 낙하로 전환)
  - `.seed-ceremony__soil-cover` (앞쪽 흙 더미) + `.seed-ceremony__soil-covered` (덮인 봉분, 페이드+스케일)
  - `.seed-ceremony__shovel` — 토닥토닥 다지는 삽 (rotate keyframe)
  - `.seed-ceremony__title` — 본문 안내 텍스트 (22px / 600 / `var(--color-wood-2)`)
  - `.seed-ceremony__planting-status` (種を植えています) + `.seed-ceremony__planted-message` (創作のタネを植えました…) — 동일 wavy SVG 배지 배경 (`img_seed_status_border.svg`, `100% 100%` 가변 폭) 공유
  - `.seed-ceremony__form` — 입력 카드(`img_seed_input_border.svg` 636×80 wavy 테두리 배경) + 植える 버튼(`img_seed_submit_border.svg` 117×80 wavy 테두리 배경)
  - `.seed-ceremony__textarea` + `.seed-ceremony__counter` — maxlength 30 · `data-seed-counter` 로 N/30 카운터 갱신
- **상태 클래스 체인 (modal-backdrop)**:
  - `.is-planted` — 폼 퇴장 + 씨앗 낙하 시퀀스 시작
  - `.is-covered` — soil-covered 페이드/스케일 + planted-message 슬라이드 인 + planting-status 퇴장
  - `.is-tamped` — shovel 등장 + 토닥토닥 keyframe 재생
- **닫기**: `data-modal-close` 미부착 — 植える 클릭 후 시퀀스 종료 시점에 `modal-backdrop--open` 제거 + `series-post-management.html` 자동 redirect (페이지 inline `<script>` 의 `SEED_TIMING.REDIRECT_DELAY` 후)
- **React 이식**: `<SeedCeremony />` 단일 컴포넌트. 시퀀스는 `useEffect` 안 `await wait(SEED_TIMING.X)` 체인. WAAPI 3-phase(gather/fall/bounce) 각 `.finished` await 패턴 그대로 사용 가능

#### `#modal-context` (作品コンテキスト 공통 모달) → shadcn `Dialog` (재사용 컴포넌트)
- **단일 진실의 원천 (SSOT)**: `js/components/modal-context.js` 의 `MODAL_HTML` template literal
- **목적**: 우측 채팅 패널의 "+" 버튼([data-modal-open="#modal-context"])이 있는 모든 페이지에서 공유 — 마크업 복제 없이 한 곳에서 관리
- **주입 방식**: DOMContentLoaded 시 `body` 끝에 innerHTML 주입 · 이미 `#modal-context` 가 존재하면 skip (이중 주입 방지)
- **사용 페이지**: workroom / workspace / workspace-onboarding / series-edit / series-register / series-post-management / series-post-management-empty / account-setting (8개)
- **구조**: 3-step (작품 선택 → 캐릭터/스토리 리스트 → 입력 폼) · viewport+track 슬라이드 · tab-group 으로 character ↔ story 전환 (step 2/3 간 동기화)
- **React 이식**: `<ModalContext />` 컴포넌트로 1:1 변환 — 마크업이 JS 안에 있어 props/state 매핑이 직관적

#### `.chat-input` → shadcn `Textarea` + icon buttons
- Container: `.chat-input__field` (textarea 감싸는 필드)
- Actions: `.chat-input__actions` (첨부/전송)
- Auto-resize: 32px ~ 120px
- `aria-label="AIへのメッセージ"`

#### `.input-wood` → shadcn `Input` (variant=wood)
- wood-5 outline, white-50 배경
- states: default / hover(wood-3) / focus-within(wood-3) / disabled(wood-5)
- focus ring 키보드 전용 (`body:not(.using-mouse)` 패턴)

#### `.form-input` → shadcn `Input` (variant=default)
- white 배경, gray-5 outline, min-height 36px, radius `--radius-sm`(10px), shadow `0 1px 2px rgba(0,0,0,.05)`
- States (Figma 9상태 → CSS 4 modifier): default / hover(black-100) / focus-within(black-100) / focus(+3px gray-5 ring · 키보드 전용) / **error**(red-100) / disabled
- **Disabled는 배경 white 유지** (gray-6 아님) · placeholder/text 모두 black-30
- Completed(값 입력 후 blur)는 `default + 값` → 별도 클래스 불필요
- focus ring은 `body:not(.using-mouse)` 패턴 — input `:focus-visible`이 마우스에도 적용되는 브라우저 버그 회피
- placeholder: black-50 / focus 시에도 유지 (값 입력 중에만 자연스럽게 가려짐) — focus 시 숨김은 `.input-wood` 전용
- **동작 (`js/components/form-input.js`)**: 컨테이너 클릭 시 내부 input/textarea로 포커스 위임 — padding 영역을 클릭해도 입력 상태로 전환 (React: shadcn `Input` 사용 시 `<label>`로 감싸거나 `onClick`에 `ref.current.focus()` 처리)

#### `.form-textarea` → shadcn `Textarea`
- `.form-input`과 동일 컬러 토큰, 차이점: `min-height: 108px` (5줄 고정 = line-height 18px × 5 + padding 상하 16px + 2px 안전 마진), `align-items: flex-start`
- **패딩은 textarea 자체에 부여** (`.form-textarea__field { padding: var(--space-2) var(--space-3); scroll-padding-block-end: var(--space-2); box-sizing: border-box; }`). 컨테이너 패딩은 0 — 내부 스크롤 시 줄 중간이 경계에서 잘려 보이는 현상 방지. `scroll-padding-block-end` 8px 은 타이핑 auto-scroll 시 커서가 content-box 하단에 붙지 않도록 여유 확보 (Chrome/Firefox 지원, Safari 일부 무시)
- **스크롤바 숨김**: `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` — 스크롤 기능은 유지, 시각적 막대만 제거
- `.form-textarea__field { resize: none; align-self: stretch; }`
- States: default / hover(black-100) / focus-within(black-100) / focus(+3px gray-5 ring · 키보드 전용) / **error**(red-100) / disabled
- **Disabled 배경 white 유지**, placeholder/text black-30
- Figma 원본에 textarea Caution 상태는 없으나 input과 통일 위해 `--error` modifier 제공

#### `.form-field` → shadcn `FormField` 래퍼 (`react-hook-form` 조합)
- 구조: `__label` (title + optional `__required` red dot 6×6) → body(input/textarea/avatar-upload) → `__hint` / `__caution`
- `.form-field__title`: `--font-size-caption` w6 / black-100
- `.form-field__hint`: caption w4 / black-50
- `.form-field__caution`: caption w4 / red-100 (에러 상태)
- gap 6px, column flex, `width: 100%` (부모 컨테이너 폭 따름 · Figma 기준 300px)
- body가 `.avatar-upload`일 때만 `:has()`로 gap을 16px(`--space-4`)로 확대 — 아바타 블록은 라벨과 간격이 더 필요
- **Figma 레이아웃 variant 5종**:
  1. `.form-textarea` only (하단 문구 없음)
  2. `.form-textarea` + hint
  3. `.form-textarea--error` + caution
  4. `.form-input`(stretch) + hint
  5. `.form-input--error` + caution
- 짧은 숫자 입력(narrow width)이 필요한 경우는 `.input-wood` (타이머 전용 variant)로 대체 — form-field 내 narrow modifier는 제공하지 않음
- `__required` red dot은 Figma 레퍼런스엔 없으나 필수 입력 UX를 위해 프로젝트 확장으로 유지

#### `.avatar-upload` → 커스텀 (shadcn `Avatar` + `Button` + `Input[type=file]` 조합)
- 80×80 원형 프리뷰(`__preview` · gray-5 outline · white 플레이스홀더 배경) + body(업로드 버튼 + hint)
- gap 20px (--space-5), 가로 정렬 (container padding 없음)
- 업로드 버튼: `.btn.btn-line.btn--sm` + `.icon.icon-folder-open` + 텍스트
- 이미지 등록 시 `.avatar-upload__image` (object-fit: cover)
- **동작 (`js/components/avatar-upload.js`)**: 각 `.avatar-upload`에 hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`를 자동 주입 → 버튼 클릭 시 OS 파일 선택 다이얼로그 오픈 → 선택 후 FileReader로 `__preview` 이미지 갱신
- TODO: 업로드 후 서버 저장 / 삭제 동작은 React 쪽에서 구현

#### `.accordion-row` → shadcn `Accordion` + `AccordionItem`
- 섹션 토글 / 단일 링크 리스트 행. 기본 폭 504px (`--p35`), min-height 80px, padding 20px 24px
- HTML 구조: `.accordion-row` > `.accordion-row__header` (button) > `.accordion-row__body` (title + desc) + `.accordion-row__chevron`
- 3 variants:
  - **기본 (접혀있을 때)**: 제목 14px/w6 + 설명 11px/w4 + chevron (`.icon-keyboard-arrow-down`) black-30
  - **확장 (펼쳐져 있을 때)**: `.accordion-row--active` — 제목 14→16px 부드럽게 확대, 설명 숨김, chevron 색상만 black-100 (rotation 없음)
  - **단일 링크**: `.accordion-row--link` — 토글 기능 없음, chevron `.icon-exit-to-app` · black-100. `<a>` 태그로 사용
- `min-width: var(--p35)` (504px) — 그 이하로 축소 금지
- title font-size transition으로 접힘↔펼침이 자연스럽게 연결됨
- hover / focus 시각 효과 없음 (클릭 시 active 토글만)
- 확장 콘텐츠: `.accordion-row__content` (default hidden, `.accordion-row--active` 시 표시)
- chevron: `.icon-keyboard-arrow-down` (기본/active) · `.icon-exit-to-app` (single link)
- **`.accordion-row--card` modifier**: 16px border-radius + soft shadow(`0 4px 8px rgba(0,0,0,.02), 0 0 1px rgba(0,0,0,.1)`) — 세팅 페이지 등 카드로 나열할 때. 기본/active/link variant 전부와 병용 가능
- **Caution 아이콘**: `.accordion-row__title` 내부에 `<i class="icon icon-error-filled">` 추가 → title 텍스트는 black-100 유지, 아이콘만 red-100. title은 `display: inline-flex; gap: 8px`로 텍스트 + 아이콘을 정렬. 기본/active/link 모두 동일 패턴
- **Trailing 요소 (옵션)**: `.accordion-row__header` 안 `body`와 `chevron` 사이에 아래 요소를 삽입 가능. 세 조합 지원:
  1. **아바타 + 아이콘**: `<img class="accordion-row__avatar">` (44×44 원형, `border-radius: 50%`, `object-fit: cover`, fallback bg `--color-wood-6`) + chevron
  2. **배지 + 아이콘**: `<span class="badge badge--nature">...</span>` + chevron
  3. **아이콘 only**: chevron 단독 (기본)
  header flex의 `gap: var(--space-3)` (12px)로 trailing 요소들이 자연스럽게 띄워짐
- TODO: React에서는 shadcn `Accordion` (Radix) 사용 — `AccordionTrigger`(header) / `AccordionContent`(content). 단일 링크 variant는 별도 `<Link>` 컴포넌트로 분리

#### `.section-label` → 커스텀 `<SectionLabel>` (typography utility)
- 리스트/카드 그룹 상단 섹션 헤딩 (예: reader-account-setting 의 「プロフィール」/「ログイン情報」/「アカウント操作」)
- HTML 구조: `<div class="section-label">プロフィール</div>` — children 직접 텍스트 1줄
- Spec: 12/18 w600, black-100, padding `24px 8px 6px` (상/좌우/하)
- flex 컬럼 컨테이너 안에서 `align-self: stretch`로 전체 폭 차지 (컴포넌트 자체는 `display: block`)
- 컨테이너에 font-size/line-height를 **직접** 지정해 body 16px 상속에 의한 line-box 팽창(26px)을 차단 — React 이식 시에도 외부 `<span class="text-caption-w6">` 래핑 대신 컴포넌트 자체가 타이포를 소유하도록 유지

---

### 레이아웃 계열

#### `.navbar` → 커스텀 `<header>`
- fixed position, z-index 최상위, `min-width: var(--base)` 필수
- 높이 64px (`--navbar-height`)
- 좌: 로고 / 우: 버튼 그룹
- Work Mode 변형: 탭 + 작업종료 버튼 (`.navbar--work-mode`)
- Transparent 변형: 로고만 · 배경/그림자/버튼 없음 (`.navbar--transparent`) — 레이아웃 점유 동일

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

#### `.emotion-pick` → 커스텀 RadioGroup item
- 水やり 모달의 감정 선택 라디오. `<label>` + 숨겨진 `<input type="radio">` 패턴 (radio-card와 동일 계열)
- 같은 `name` 내에서 단일 선택. 부모는 `role="radiogroup"` + `aria-label`
- 80×auto · padding `12 0` · radius 16 · gap 4 · 흰색 배경
- 아이콘 36×36 (mask-image + currentColor), 라벨 12/18 (w4 → 선택 시 w6)
- States (Figma 5상태):
  - Default     : icon = `--color-gray-5`, label = `--color-gray-3` / w4
  - Hover       : icon = `--color-gray-4`, label = `--color-font-primary-black-100` / w4
  - Focus       : Hover + 3px gray-5 ring + 0 1px 2px shadow (키보드 전용, `body:not(.using-mouse)`)
  - Pressed     : Hover와 동일
  - Selected    : icon = `--color-sky-3`, label = black-100 / w6
- TODO: 색상 토큰별 emotion 고유색 분리 여부 (현재 선택 시 모두 sky-3 단일 색)

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

#### `.character-card` → shadcn `Card` composition (선택 카드)
- 파트너 선택 화면 전용 조합 카드. 300×300 고정
- 배경은 `bg_postit_*.png`(3색) — `background-size: 300px 300px`, `background-repeat: no-repeat`
- **Variant (포스트잇 색)**: `.character-card--blue` / `.character-card--yellow` / `.character-card--pink`
- 캐릭터 초상: `.character-card__portrait` — **124×124 원형 클리핑** (`border-radius: 50%` + `object-fit: cover` + `object-position: center`, `background: var(--color-wood-6)` fallback). 원본 PNG는 `img_character_{fuku|hana|tonton}_{default|selected}.png` (132×124, 그림자 포함 · CSS filter 없음). 어떤 이미지가 들어와도 동그라미로 렌더되도록 설계 — v1.05.3 적용
- 헤더: `__header` → `__name-row` (이름 `text-h3-w6` 22/600 + 역할 `text-caption-w6` 12/600 muted, gap `--space-1_5`) → 초상 (gap `--space-3`)
- 설명: `__description` — `text-caption-w6` 중앙정렬, `--color-font-primary-black-50`
- 내부 padding `--space-9 --space-5_5 44px`(상/좌우/하), flex-column gap `--space-4`, `align-items: center`
- **옵션 추천 버블**: `.character-card__bubble` — 76×76 absolute (`top: 68px`, `left: 18px`), `img_bubble_recommend.png` (「あなたにおすすめ」)
- **Hover / Selected 상태**: `role="radio"` 카드에 `:hover` 또는 `.is-selected` 적용 시 포스트잇 픽셀 위에 40% 톤다운 오버레이 표시
  1. 오버레이 구현 → `::before` pseudo-element에 `#000` + `mix-blend-mode: overlay` + `mask-image: var(--character-card-bg)` (포스트잇 알파 영역에만 블렌드, PNG 투명부는 오염 없음). `opacity: 0 → 0.4` 전환 (0.15s `--ease-standard`)
  2. 초상 → `img_character_{fuku|hana|tonton}_selected.png` (JS로 `src` 스왑 — `data-portrait-default` / `data-portrait-selected` 속성 활용). **`_selected.png`은 페이지 로드 시 프리로드 필요** (최초 클릭 시 네트워크 지연 방지 — `new Image()` 또는 `<link rel="preload" as="image">`)
  3. 체크 뱃지 → `.character-card__check` (52×58 @2x, 우상단 absolute · `top: 80px` / `right: 38px` · `img_check_selected.png`) — 기본 `display: none`, `.is-selected` 시 표시
- Focus ring: `:focus-visible` 시 `box-shadow` ring(`--ring-width` / `--color-gray-5`) + `border-radius: var(--radius-sm)`
- Radio 그룹 사용 예: `creative-partner-onboarding-05.html` (`role="radiogroup"` 래퍼 + 카드 선택 시 `決定する` 버튼 `disabled` 해제)
- Figma: Frame2087333501

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
