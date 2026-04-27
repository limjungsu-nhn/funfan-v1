# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.5 요약 (2026-04-27, v1.05.4 후속) — 먼저 이것만 보세요

**인증 플로우 + Floom 파트너 온보딩 시퀀스 + radio-list 컴포넌트 배치.** 기존 구현 깨지는 변경 없음.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **인증 화면 3종 신설** 🆕 | `auth-login.html` / `auth-signup.html` / `auth-signup-password.html`. 로그인 → cp-onboarding-01, 회원가입 → 비밀번호 설정 → cp-onboarding-01 라우팅. 비밀번호 검증 3-rule + 불일치 caution(`form-input--error` + `パスワードが一致しません`) | shadcn `Form` + `Input` 변형. `登録する` 항상 활성, 검증 실패 시 caution 표시 + focus 이동 |
| **Floom 파트너 온보딩 6단계 신설** 🆕 | `creative-partner-onboarding-01.html` ~ `-06.html`. Step 1 인사 + CTA, Step 2~5 입력(펜네임/장르/스타일/스킬/목표), Step 6 캐릭터 카드 추천 | step 라우팅 그래프 등록. step 진입 시 progress bar `--progress-from` → `--progress-to` 보간 (CSS 변수 + keyframe) |
| **`radio-list` 컴포넌트 신설** 🆕 | `css/components/radio-list.css`. 1줄 리스트형 라디오. avatar(letter) · icon 두 슬롯 지원, 우측 check 18px. radio · checkbox 모두 동작 | shadcn `RadioGroup` + 리스트 아이템 매핑. avatar/icon 폴리모픽 슬롯, `:has(:checked)` 자동 selected |
| **신규 아이콘 11종** 🆕 | `bolt` · `castle` · `close` · `filter-vintage` · `help` · `light-mode` · `skull` · `tool-tip` · `visibility` · `visibility-off` · `visibility-on`. 총 51개 | lucide 매핑 [`ICONS.md`](./ICONS.md) 참조 |
| **form-input toggle-password 공통화** | 페이지별 중복 토글 스타일 → `form-input.css` 의 `[data-role="toggle-password"]` 단일 규칙으로 통합. `aria-pressed="false"` opacity 0.5 / `true` 100% | cva variant 또는 Tailwind `aria-pressed` modifier 로 표현 |
| **신규 토큰 3종** | `--space-11: 44px` · `--space-15: 60px` · `--space-50: 200px`. `design-tokens.json` + `tailwind-preset.ts` 동기화 | preset import 만 하면 자동 반영 |
| **cp-onboarding 페이지 CSS** | `body:has(.creative-partner-onboarding)` 흰색 배경 · `--top` modifier · top progress bar (position fixed · z-index 200 · `cp-progress-grow` 600ms ease-out 애니메이션) · 720px(`--p50`) · 576px(`--p40`) 컬럼 정의 | 페이지 전용 — 컴포넌트 영향 없음 |
| **이미지 에셋** | `img/bg_postit_{blue,pink,yellow}.png` 색상 미세 조정 | CDN/`public/img/` 재반영 |
| **logo · 토큰 정합성 정리** | `logo--lg` 120×45 → 128×48 (auth 페이지 표준화) · `auth-*.css` divider gap 하드코딩 18px → `var(--space-4)` · `cp-onboarding step2 width 720px` → `var(--p50)` | 사용처 없는 변경 (logo--lg) — 영향 없음 |
| **styleguide · index 싱크** | radio-list 섹션 신설 (5 state 정적 + 인터랙티브 그룹 데모) · 신규 아이콘 11종 카드 추가 · index.html 신규 9개 페이지 묶음을 styleguide 아래로 이동 + ✅ 표시 | 디자인 참조용 — 개발 영향 없음 |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- `logo--lg` 사이즈 변경 — 기존 사용처 없음
- form-input `[data-role="toggle-password"]` 셀렉터 신규 — 기존 페이지 영향 없음

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.5 항목 — **개발 액션 요약**
2. `styleguide.html` radio-list 섹션 — 정적 5 state + 인터랙티브 그룹 데모
3. `auth-login.html` / `auth-signup.html` / `auth-signup-password.html` — 인증 플로우 라우팅·검증 확인
4. `creative-partner-onboarding-01.html` ~ `-06.html` — 6단계 시퀀스 + progress bar 진입 애니메이션 확인

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
