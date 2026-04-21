# FunFan v1.0 — 아이콘 매핑 (Material → Lucide React)

프로토타입은 Google Material Symbols 기반 SVG를 data URI로 인라인 임베드.
Shadcn 프로젝트에서는 **lucide-react**를 기본으로 사용하는 것이 일반적이므로
아래 매핑을 참조해 치환.

- **Source**: `css/components/icon.css` (mask-image data URI)
- **크기 variant**: `icon--sm` (16px) / 기본 (18px) / `icon--md` (20px)
- **색상**: `currentColor` — 부모 `color:` 속성 따라감

---

## 매핑 테이블

| 우리 클래스 | 용도 힌트 | lucide-react | 비고 |
|---|---|---|---|
| `icon-account-circle` | 사용자 메뉴 | `CircleUserRound` | Material: `account_circle` |
| `icon-add` | 추가/첨부 | `Plus` | Material: `add` |
| `icon-arrow-upward-alt` | 채팅 전송 | `ArrowUp` | Material: `arrow_upward_alt` |
| `icon-bar-chart` | 통계/차트 (축약명) | `BarChart3` | `.icon-bar-chart-4-bars`와 동일 mask — alias |
| `icon-bar-chart-4-bars` | 통계/차트 | `BarChart3` | Material: `bar_chart_4_bars` (막대 4개) |
| `icon-cancel-filled` | 취소/삭제 (filled) | `XCircle` + `fill` | Material: `cancel` (원형 X, filled) |
| `icon-check` | 체크(굵음) | `Check` | Material: `check` |
| `icon-check-circle` | 성공/완료 | `CircleCheck` | Material: `check_circle` |
| `icon-check-small` | 체크(얇음) | `Check` | Material: `check_small` — lucide는 1종만 있으므로 stroke 조정 |
| `icon-chevron-left` | 이전/뒤로 | `ChevronLeft` | |
| `icon-chevron-right` | 다음/상세 | `ChevronRight` | |
| `icon-edit` | 편집 | `Pencil` 또는 `Edit` | Material: `edit` |
| `icon-error` | 에러/경고 (outline) | `CircleAlert` | Material: `error` — outline 기본 |
| `icon-error-filled` | 에러/경고 (filled) | `CircleAlert` + `fill` | Material: `error` (filled variant) |
| `icon-exit-to-app` | 나가기/종료 | `LogOut` | Material: `exit_to_app` |
| `icon-fast-forward` | 빨리감기 (4중 삼각) | 커스텀 | Material: `fast_forward` (double-step variant) — 얇은 4개 삼각 |
| `icon-fast-forward-filled` | 빨리감기 (2중 라운드) | `FastForward` (filled) | 라운드 필드형 2중 삼각 — `fill="currentColor"` |
| `icon-favorite` | 좋아요/하트 (outline) | `Heart` | Material: `favorite` — outline 기본 |
| `icon-favorite-filled` | 좋아요/하트 (filled) | `Heart` + `fill="currentColor"` | Material: `favorite` (filled variant) |
| `icon-folder` | 폴더 | `Folder` | |
| `icon-folder-open` | 폴더 열기/업로드 | `FolderOpen` | Material: `folder_open` — avatar-upload 업로드 버튼 |
| `icon-format-paint` | 꾸미기/페인트 | `Paintbrush` 또는 `PaintBucket` | Material: `format_paint` |
| `icon-horizontal-align-right` | 정렬(오른쪽) | `AlignHorizontalJustifyEnd` | 드문 아이콘 — 커스텀 SVG 유지 권장 |
| `icon-humidity-high-filled` | 수분/물방울(가득) | `Droplet` + `fill` | Material: `humidity_high` (filled) |
| `icon-humidity-low` | 수분/물방울 | `Droplet` | Material: `humidity_low` |
| `icon-keyboard-arrow-down` | 드롭다운/펼치기 | `ChevronDown` | Material: `keyboard_arrow_down` |
| `icon-laptop-mac` | 워크스페이스 | `Laptop` | Material: `laptop_mac` |
| `icon-pause-filled` | 일시정지 (filled) | `Pause` + `fill` | Material: `pause` (filled) |
| `icon-play-arrow-filled` | 재생/시작 (filled) | `Play` + `fill` | Material: `play_arrow` (filled) |
| `icon-right-panel-close` | 패널 닫기 | `PanelRightClose` | Material: `right_panel_close` |
| `icon-schedule` | 시간/스케줄 | `Clock` | Material: `schedule` |
| `icon-sentiment-excited` | 감정(들뜸) | `Laugh` 또는 `Smile` | Material: `sentiment_excited` |
| `icon-sentiment-sad` | 감정(슬픔, outline) | `Frown` | Material: `sentiment_sad` — outline 기본 |
| `icon-sentiment-sad-filled` | 감정(슬픔, filled) | `Frown` + `fill` | Material: `sentiment_sad` (filled variant) |
| `icon-sentiment-very-satisfied-filled` | 감정(매우 만족, filled) | `Laugh` + `fill` | Material: `sentiment_very_satisfied` (filled) |
| `icon-settings` | 설정 | `Settings` | |
| `icon-stop-filled` | 정지 (filled) | `Square` + `fill` | Material: `stop` (filled) |
| `icon-stylus-note` | 작품/그리기 | `PencilLine` 또는 `PenTool` | Material: `stylus_note` |
| `icon-swap-vert` | 정렬 전환 (세로 양방향 화살표) | `ArrowUpDown` | Material: `swap_vert` — episode-header 정렬 토글 |
| `icon-unfold-more` | 더 보기/확장 | `ChevronsUpDown` | Material: `unfold_more` |

---

## 사용 패턴

### React (lucide-react)
```tsx
import { Play, Pause, Square } from 'lucide-react';

<button aria-label="一時停止">
  <Pause className="h-5 w-5" strokeWidth={2} />
</button>
```

### 크기 매핑
| 프로토타입 | 권장 Tailwind |
|---|---|
| `icon--sm` (16px) | `h-4 w-4` |
| 기본 (18px) | `h-[18px] w-[18px]` (또는 `h-5 w-5` 허용) |
| `icon--md` (20px) | `h-5 w-5` |

### 색상
lucide는 `stroke="currentColor"` 기본. 부모 텍스트 색상이 적용됨.
```tsx
<div className="text-nature-2">
  <Play /> {/* nature-2 색상 */}
</div>
```

---

## 주의사항

1. **outline ↔ filled 변형 규칙** — 기본(base)은 outline, filled variant는 `-filled` 접미사
   - `icon-favorite` (outline) ↔ `icon-favorite-filled` (solid heart)
   - `icon-sentiment-sad` (outline) ↔ `icon-sentiment-sad-filled` (filled face)
   - `icon-error` (outline) ↔ `icon-error-filled` (filled circle)
   - `icon-fast-forward` (outline 4중 삼각) ↔ `icon-fast-forward-filled` (filled 2중 라운드)
   - lucide-react에서는 outline 버전은 기본 컴포넌트, filled 버전은 `fill="currentColor"` 추가로 대응
2. **filled-only 아이콘** (outline pair 없음, 컨벤션상 `-filled` 명시): `icon-cancel-filled`, `icon-pause-filled`, `icon-play-arrow-filled`, `icon-stop-filled`, `icon-humidity-high-filled`, `icon-sentiment-very-satisfied-filled`
   - lucide 기본 outline과 다르므로 `fill="currentColor"` 적용
   - `icon-check-circle`은 예외적으로 base 이름 유지 (pair 없음)
3. **`icon-horizontal-align-right`, `icon-fast-forward`(4중 삼각)는 lucide에 완벽히 동일한 형태 없음**
   - 원본 SVG(`icons/*.svg`)를 커스텀 아이콘 컴포넌트로 이식 권장
4. **크기 조정**: lucide 기본 stroke=2. 우리 디자인과 맞지 않으면 `strokeWidth` 조정

---

## 체크리스트 (개발 쪽)

- [ ] `lucide-react` 설치
- [ ] 매핑표 기준 컴포넌트 교체
- [ ] 색상은 부모 텍스트 색으로 상속되는지 테스트
- [ ] 특수 아이콘 2~3개(`horizontal-align-right` 등)는 커스텀 SVG로 보존
- [ ] aria-label은 **버튼**에, `aria-hidden="true"`는 **아이콘 자체**에
