# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.2 요약 (2026-04-23, v1.05.1 후속) — 먼저 이것만 보세요

**v1.05.1 배송 이후 반영된 변경 일괄.** 기존 구현 깨지는 변경 없음.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **신규 페이지 본문** | `mypage.html` **본문 완성** (쉘 → 실제 페이지) — 헤더 + 프로필 진입 카드 + Phase 0 안내 | `mypage` 라우트·레이아웃 추가 |
| **컴포넌트 인터랙션** | `accordion-row` hover 효과 신설 — `--card`는 shadow lift + z-index↑, 비-card `--link`는 bg tint | cva `hover` variant 축 추가 |
| **토큰 추가** ⚠ | `--color-shadow-soft: rgba(0,0,0,0.06)` · tailwind preset `shadow-card-hover` | `tailwind-preset.ts` **재import** |
| **라우팅 연결** | navbar `マイページ` / `ワークスペース` 버튼 → `<a href>` 로 전환 (8개 페이지) | `<Link>` + `<Button asChild>` 패턴으로 이식 |
| **코드 정리** | typography.css min-width 토큰화 · tailwind-preset `p2-5` → `p2_5` 정정 · Figma 고정값 의도 주석 보강 · `series-home`에 keyboard-focus 로드 | **영향 없음** (내부 정리) |

**다음 배치 예정**
- `creative-partner-onboarding-01~04` 본문 (현재 쉘 상태 유지)

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- `accordion-row` 기본 상태 렌더는 동일 — hover 시에만 lift/tint 추가
- navbar 버튼 → 앵커 전환은 시맨틱만 바뀜 (스타일 동일)

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.2 항목 — **개발 액션 요약** 4줄
2. [`tailwind-preset.ts`](./tailwind-preset.ts) — `shadow-card-hover` preset 추가, 프로젝트에 재import
3. `mypage.html` · `styleguide.html` (accordion-row hover) — 실제 동작 확인

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
