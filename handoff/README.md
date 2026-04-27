# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.6 요약 (2026-04-27, v1.05.5 후속) — 먼저 이것만 보세요

**cp-onboarding 시퀀스 시각 디테일 보정 패치.** 신규 페이지·컴포넌트·토큰 없음. 기존 구현 깨지는 변경 없음.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **장르 아이콘 4종 교체** | `creative-partner-onboarding-02.html` 장르 그리드. `恋愛` favorite → **favorite-filled** · `日常` sentiment-very-satisfied-filled → **light-mode** · `BL・GL` favorite-filled → **filter-vintage** · `まだ決めていない` schedule → **help** | 페이지 마크업의 `icon-*` 클래스 교체만. 아이콘 토큰·매핑 변경 없음 |
| **hint 위치/정렬** | `__step2-hint` 를 `form-field` 내부 → **`form` 직속**으로 한 단계 꺼냄. `text-align: center` 추가 | 페이지 마크업 한 줄 이동 |
| **desc 텍스트 사이즈 (02~05)** | `__step2-desc` 텍스트 클래스 `text-subtext-w4` (14px) → **`text-assist-w4`** (13px). 4페이지 적용 | 마크업 클래스 교체. 토큰·typography.css 변경 없음 |
| **그리드 gap 분리** | 기존 `__genre-grid, __skill-grid` 공용 룰 분리. `__genre-grid` 8 → **10px** (`--space-2_5`) · `__skill-grid` 8px (`--space-2`) 유지 | cp-onboarding.css 만 변경 |
| **dead code 정리** | `.creative-partner-onboarding--top` 의 `padding-top: 0` 제거 (부모에 padding-top 없어 무효) | 영향 없음 |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- 모든 변경이 cp-onboarding 02~05 페이지 마크업 + cp-onboarding.css 한정

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.6 항목 — **개발 액션 요약**
2. `creative-partner-onboarding-02.html` — 장르 아이콘 4종, hint 위치/정렬
3. `creative-partner-onboarding-02~05.html` — desc 13px 통일

---

## 파일 안내

### 디자인 → 개발 매핑
| 파일 | 용도 | 대상 |
|---|---|---|
| [`design-tokens.json`](./design-tokens.json) | 모든 디자인 토큰 (color/spacing/typography/shadow/radius) | 참고용 원본 |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Tailwind `theme.extend` 프리셋 | `tailwind.config.ts`에 직접 import |
| [`COMPONENTS.md`](./COMPONENTS.md) | 45개 컴포넌트 → shadcn 매핑 + variant/size/state | cva 정의 작성 시 |
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
