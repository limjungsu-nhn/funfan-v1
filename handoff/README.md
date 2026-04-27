# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.7 요약 (2026-04-28, v1.05.6 후속) — 먼저 이것만 보세요

**메인 디스커버리 + 작품 등록 + 작품 관리 페이지 배치.** 4개 신규 페이지 + 7개 신규 컴포넌트 + 무한 스크롤 JS + 20장 작품 표지. 기존 구현 깨지는 변경 없음.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **신규 페이지 4종** | `main-home.html` (디스커버리 피드 + 무한 스크롤) · `creator-series-home.html` (작가용 시리즈 홈) · `series-register.html` (작품 등록 폼) · `series-post-management-empty.html` (작품 관리 empty state) | Next.js 라우팅 4개 추가. 우선순위: main-home > series-register > 관리 페이지들 |
| **신규 컴포넌트 7종** | `post-card` (322px Pinterest 카드) · `post-manage` (작품 관리 행 720px) · `empty-state` (720×360 플레이스홀더) · `form-card` (720px 폼 래퍼) · `thumbnail-upload` (100%×280 업로드 영역) · `inline-alert` (배너) · `radio-block` (큰 면적 라디오) | 신규 cva 정의 7개. 자세한 매핑은 [`COMPONENTS.md`](./COMPONENTS.md) |
| **무한 스크롤 JS** | `js/pages/main-home.js` — IntersectionObserver + 4-column flex masonry + JS append-to-shortest. CSS columns 대신 JS 로 컬럼 분배(추가 시 기존 카드 재정렬 방지). 셔플 비복원 풀 + `RECENT_AVOID=8` 으로 viewport 내 중복 차단 | React: `useEffect(IO observer)` + `useState(columns[])` 패턴으로 이식 |
| **신규 토큰** | color: `--color-red-10` (#FFEAE8), `--color-red-text` (#FB2C36) — inline alert 전용 · layout: `--space-0_5` (2px), `--space-45` (180px) | Tailwind preset 동기화 |
| **신규 아이콘** | `icon-delete` (휴지통) | lucide-react `Trash2` 매핑 |
| **신규 에셋** | `img/img_comic_01.png` ~ `img_comic_20.png` (가로 644px · 자연 비율) | public/ 으로 그대로 이관 |
| **인라인 스타일 제거** | `creative-partner-onboarding-02~05.html` 의 `style="--progress-from/to"` 4건 → `__progress--step1~4` modifier 클래스로 대체 | Rule #1(인라인 스타일 금지) 전체 페이지 준수 상태 달성 |
| **styleguide 정비** | `.sg-demo-canvas` → `.sg-type-table` 일괄 변환(6종) · 720px 컴포넌트용 preview modifier 추가 · nav 평탄화 | 디자인 시스템 문서 일관성 향상 (개발에 직접 영향 없음) |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- 신규 컴포넌트는 모두 추가만 (기존 컴포넌트 시그니처 유지)
- `--episode-card-width` 가 하드코딩 1000px → `var(--p70)` (1008px) 로 8px 미세 변경 — 시각 영향 거의 없음

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.7 항목 — **개발 액션 요약** (특히 post-card mix-blend-mode border + 무한 스크롤 구현 노트)
2. [`COMPONENTS.md`](./COMPONENTS.md) — 7개 신규 컴포넌트 shadcn 매핑
3. `main-home.html` + `js/pages/main-home.js` — Pinterest masonry + 무한 스크롤 패턴
4. `series-register.html` — `form-card` + `thumbnail-upload` + `inline-alert` + `radio-block` 합성 예시

---

## 파일 안내

### 디자인 → 개발 매핑
| 파일 | 용도 | 대상 |
|---|---|---|
| [`design-tokens.json`](./design-tokens.json) | 모든 디자인 토큰 (color/spacing/typography/shadow/radius) | 참고용 원본 |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Tailwind `theme.extend` 프리셋 | `tailwind.config.ts`에 직접 import |
| [`COMPONENTS.md`](./COMPONENTS.md) | 52개 컴포넌트 → shadcn 매핑 + variant/size/state | cva 정의 작성 시 |
| [`ICONS.md`](./ICONS.md) | 51개 아이콘 → lucide-react 매핑 | 아이콘 치환 시 |

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
