# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05 요약 (2026-04-22) — 먼저 이것만 보세요

**기존 구현에 깨지는 변경 없음.** 토큰 치환은 전부 동일값 매핑 — 시각 변화 0.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **신규 페이지** | 파트너 온보딩 5단계(`creative-partner-onboarding-01~05`) · `reader-account-setting` · `mypage`(쉘만) | 라우트·페이지 컴포넌트 신규 작업 |
| **신규 컴포넌트** | `character-card` (300×300 · 3 variants · selected state) · `section-label` | cva 정의 추가 |
| **컴포넌트 확장** | `accordion-row` trailing variants 3종(avatar/badge/icon-only) + link variant · `badge--nature` | 기존 cva에 variant 축 추가 |
| **토큰 확장** ⚠ | spacing: `--space-2_5`(10px)·`--space-3_5`(14px) 추가 / radius: 2개 → **8개 시맨틱** (`xs/2xs/sm/btn/md/lg/xl/full`) | `tailwind-preset.ts` 재import만 하면 끝 |
| **하드코딩 치환** | ~30개 컴포넌트 CSS의 px를 신규 토큰으로 일괄 치환 | **영향 없음** (값 동일) |
| **문서 정리** | 스타일가이드 Forms 섹션 분해 · 빈 placeholder 제거 · CHANGELOG 갱신 | 계약 문서 스펙은 동일 |

**하위 호환**
- `--radius-sm` (10px) · `--radius-full` (100px) — 기존 2개 토큰 값 유지
- 기존 컴포넌트 클래스명·BEM 구조 변경 없음

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05 항목의 **⚠ 개발 싱크 필요** 표시
2. [`tailwind-preset.ts`](./tailwind-preset.ts) — 토큰 확장 반영됨, 프로젝트에 재import
3. [`COMPONENTS.md`](./COMPONENTS.md) `character-card` 항목 — 신규 컴포넌트 cva 작성 시

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
