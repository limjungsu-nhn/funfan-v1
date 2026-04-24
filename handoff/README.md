# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.4 요약 (2026-04-24, v1.05.3 후속) — 먼저 이것만 보세요

**모달 컴포넌트 신설 + 2-step 구조 전파 + focus ring 클리핑 정책 현대화 배치.** 기존 구현 깨지는 변경 없음.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **`modal.css` / `modal.js` 신설** 🆕 | 모달이 독립 컴포넌트로 승격 (`css/components/modal.css` · `js/components/modal.js`). 트리거(`[data-modal-open]`) · ESC · backdrop 닫기 · scroll lock · 2-step slide · summary 자동 채움 · `inert` 포커스 차단 포함 | shadcn `Dialog` 매핑으로 등록. 2-step 은 `track` state로 cva 확장 |
| **모달 2-step 전파** | `workroom` / `workspace-onboarding` / `account-setting` / `series-post-management` 4개 페이지의 단일-step 모달을 workspace 기준 2-step 구조로 치환 (`modal__viewport` > `modal__track` > 2× `modal__step`) | slide 트랜스폼은 `translateX(-50%)` 유지. step2 `.modal__form` 은 스크롤 없음 (`overflow-y-auto` 제거) |
| **focus ring 클리핑 정책** | `overflow: hidden` → `overflow: clip` + `overflow-clip-margin: var(--space-1)` 일괄 전환. 기존 padding/음수 margin 우회 전부 롤백 | Tailwind `overflow-clip` plugin 또는 `[overflow:clip] [overflow-clip-margin:4px]` arbitrary. 구형 fallback `overflow: hidden` |
| &nbsp;&nbsp;↳ 적용 범위 | **컴포넌트**: `accordion-row` · `chat-input` · `review-item` · `right-panel` · `task-list` · `water-card` · `modal__viewport` · `modal__list`. **페이지**: `app-shell` · `account-setting` · `series-post-management` · `workroom` · `workspace`. **styleguide**: `.sg-preview-panel` | 수동 치환 대상 12곳 |
| **토큰화 · 미세 조정** | `navbar.css` 하드코딩 `64px` → `var(--navbar-height)` · `tab.css` padding `space-3` → `space-3_5` (12→14px) · `.modal-backdrop` `color-mix(bg-soft 50%, transparent)` · `.modal__footer--split` 좌측 버튼 `min-width: var(--p5)` · `css/pages/index.css` `min-width: var(--base)` | cva 업데이트 — footer split variant 체크 |
| **radio-card 개정** | `.radio-card__content gap` `space-1`→`0` · 상태값 재정의 (default `bg-soft+gray-6 outline` · selected `white+nature-3`). **Variant `.radio-card--nav` 신설** — 아바타 없음 + 우측 chevron (icon-chevron-right 18px) | cva 에 `nav` variant 추가 |
| **styleguide 싱크** | Modal 정적 preview `height: 640px` 오버라이드 + step2 폼을 workspace 실제 구현과 완전 동기화. `.sg-demo-note` 유틸 추가. `btn--xs` 오타 → `btn--sm` 정정 | 디자인 참조용 — 개발 영향 없음 |
| **이미지 에셋** | `img/bg_workroom.png` 교체 | CDN/`public/img/` 재반영 |

**하위 호환**
- 모달 외부 API(open/close 이벤트, data-modal-target) 변경 없음
- 기존 토큰·클래스·BEM 구조 변경 없음
- `overflow-clip-margin` 은 미지원 브라우저에서 `overflow: clip` 만 동작 → 레이아웃 깨지지 않음 (ring 만 일부 잘릴 수 있음)

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.4 항목 — **개발 액션 요약**
2. `styleguide.html` Modal 섹션 — 정적 preview + 인터랙티브 데모 모두 workspace 실제 구현과 동기화
3. `workspace.html` / `workroom.html` / `workspace-onboarding.html` / `account-setting.html` / `series-post-management.html` — 2-step 모달 동일 동작 확인

---

## 파일 안내

### 디자인 → 개발 매핑
| 파일 | 용도 | 대상 |
|---|---|---|
| [`design-tokens.json`](./design-tokens.json) | 모든 디자인 토큰 (color/spacing/typography/shadow/radius) | 참고용 원본 |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Tailwind `theme.extend` 프리셋 | `tailwind.config.ts`에 직접 import |
| [`COMPONENTS.md`](./COMPONENTS.md) | 43개 컴포넌트 → shadcn 매핑 + variant/size/state | cva 정의 작성 시 |
| [`ICONS.md`](./ICONS.md) | 40개 아이콘 → lucide-react 매핑 | 아이콘 치환 시 |

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
