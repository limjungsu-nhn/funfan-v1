# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.9 요약 (2026-04-28, v1.05.8 후속) — 먼저 이것만 보세요

**種を植える儀式 모달 인터랙션 완성 + 글로벌 부트스트랩 통합.** 신규 페이지·신규 CSS 컴포넌트 0개. 핵심은 (1) `series-register` 등록 시 풀스크린 씨앗 의식 시퀀스 완성 — gather→fall→bounce→cover→tamp→redirect, (2) 모든 페이지 공용 키보드/입력 부트스트랩이 `js/core/_global.js` 한 줄로 통합.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **씨앗 의식 시퀀스 완성** | `series-register` 의 `登録する` 클릭 → `#modal-series-register-confirm` 오픈 → 植える 버튼 클릭 시 1) 씨앗 3개가 정중앙으로 모여 살짝 텐션 → 2) stagger 회전 낙하 → 3) 3-hit bounce 안착 → 4) 흙덮개 페이드인 → 5) 삽이 등장해 토닥토닥 → 6) 「種を植えています」 → 「創作のタネを植えました」 메시지 슬라이드 → 7) 모달 자동 닫힘 → 8) `series-post-management.html` 자동 redirect. 타이밍은 inline `<script>` 의 `SEED_TIMING` 상수 객체로 통합 관리 | React: 시퀀스 파이프라인을 `useEffect` 안에서 `await wait(SEED_TIMING.X)` 체인으로 그대로 이식. WAAPI(`element.animate().finished`) 사용 |
| **공용 부트스트랩 통합** | `js/core/_global.js` (NEW) — 기존 `js/core/keyboard-focus.js` + `js/components/form-input.js` 두 모듈을 한 IIFE 묶음으로 통합. 모든 페이지 25개가 `<script src="js/core/_global.js" defer>` 한 줄로 키보드 포커스 + input 컨테이너 클릭 위임 부트스트랩. 구파일 2개 삭제 | React: `<RootLayout>` 의 client component 1개로 1회 mount. 컨테이너 클릭 위임은 구조 기반(SELECTORS 리스트 없음) — 단일 input·textarea 자식이 있는 컨테이너를 max-depth 3 으로 자동 감지 |
| **씨앗 의식 자산** | 신규 SVG 11종 — `img_seed_01/02/03.svg` (씨앗 3종) · `img_seed_ceremony.svg` (1920×1080 배경) · `img_seed_cover.svg` (앞쪽 흙 더미) · `img_soil_hole.svg` (구덩이) · `img_soil_covered.svg` (덮인 봉분) · `img_shovel.svg` (다지는 삽) · `img_seed_input_border.svg` (입력카드 wavy 테두리, 636×80) · `img_seed_submit_border.svg` (버튼 wavy 테두리, 117×80) · `img_seed_status_border.svg` (메시지 배지 wavy 테두리, 가변 폭) · `img_seeds.svg` (참고용 그룹) | public/ 으로 그대로 이관. wavy 테두리 SVG 3종은 `100% 100%` 배경으로 늘여 사용 |
| **신규 CSS 컴포넌트** | `css/components/seed-ceremony.css` (NEW) — 풀스크린 의식 일러스트 레이어 + 입력 폼 + 메시지 배지 + 시퀀스 트랜지션. 로컬 토큰 4종(`--seed-ease` / `--seed-dur-slide` / `--seed-dur-fade` / `--seed-dur-fade-long`) | React: `<SeedCeremony />` 단일 컴포넌트. 상태는 `is-planted` / `is-covered` / `is-tamped` 3개의 boolean 클래스 |
| **버튼 토큰화** | `css/components/button.css` 의 `.btn-soft-red` 가 하드코딩 `#FFEAE8` 사용 → `var(--color-red-10)` 토큰 참조로 교체 | cva 정의 시 `bg-red-10` (Tailwind preset 의 동일 토큰) 그대로 매핑 |
| **CLAUDE.md 체크리스트** | 신규 페이지 생성 시 `<script src="js/core/_global.js" defer></script>` 포함 항목 추가 | (개발 영향 없음, 프로토타입 작업 규칙) |
| **인덱스 갱신** | `index.html` + `styleguide.html` 버전 라벨 v1.05.9 | (개발 영향 없음, 디자인 인덱스용) |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- 신규 CSS 컴포넌트 1개(`seed-ceremony`) — series-register 1페이지 전용
- `_global.js` 통합 — 25개 HTML 의 `<script>` 한 줄 변경, 동작 동일

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.9 항목 — **개발 액션 요약**
2. `series-register.html` inline `<script>` — `SEED_TIMING` 상수 + async/await 시퀀스 + WAAPI gather/fall/bounce 패턴
3. `css/components/seed-ceremony.css` — 풀스크린 일러스트 모달 레이어 구성
4. `js/core/_global.js` — 키보드 포커스 + 구조기반 input 컨테이너 클릭 위임 패턴

---

## 파일 안내

### 디자인 → 개발 매핑
| 파일 | 용도 | 대상 |
|---|---|---|
| [`design-tokens.json`](./design-tokens.json) | 모든 디자인 토큰 (color/spacing/typography/shadow/radius) | 참고용 원본 |
| [`tailwind-preset.ts`](./tailwind-preset.ts) | Tailwind `theme.extend` 프리셋 | `tailwind.config.ts`에 직접 import |
| [`COMPONENTS.md`](./COMPONENTS.md) | 53개 컴포넌트 → shadcn 매핑 + variant/size/state | cva 정의 작성 시 |
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
