# FunFan v1.0 — 개발 핸드오프 자료

이 폴더는 shadcn/ui + Tailwind 기반 개발팀에게 전달하는 **디자인 시스템 스펙**입니다.

---

## 📌 v1.05.8 요약 (2026-04-28, v1.05.7 후속) — 먼저 이것만 보세요

**横読み 만화 뷰어 + 작품 수정 페이지 + 모달 SSOT 추출.** 2개 신규 페이지(`viewer-yoko` / `series-edit`) + `#modal-context` 공통 모달 단일 진실의 원천(SSOT) 정착. 신규 CSS 컴포넌트는 없음 — 대부분 페이지·인터랙션·구조 정비.

| 분류 | 내용 | 개발 영향 |
|---|---|---|
| **신규 페이지 2종** | `viewer-yoko.html` (横読み 만화/노벨 뷰어, 새창 1920×1080 팝업) · `series-edit.html` (작품 수정 폼 — `series-register` 와 동일 컴포넌트 합성) | Next.js 라우팅 2개 추가. viewer-yoko 는 `target="viewer-yoko"` 새창 라우트 |
| **viewer-yoko 인터랙션 4종** | (1) 진행 상태 단일 소스 — `[role=progressbar]` 의 aria-valuenow/min/max 가 progress-bar `--progress` 너비 + 페이지 인디케이터 + nav 버튼 disabled 를 동기화 (2) 좌/우 nav 클릭 → 페이지 ±1 + 슬라이드(퇴장 + 등장) 애니메이션 (3) 콘텐츠 영역 클릭 → 상하 chrome(progress/header/footer) 토글 — `viewer-yoko--chrome-hidden` 클래스 + `margin-block-start/end` 음수값 트랜지션으로 layout 자체에서 빠져 본문 면적 확장 (4) `container-type: size` + `cqw/cqh` 로 이미지 contain 사이징 + `mix-blend-mode: darken` inset stroke 오버레이 | React: `useState(currentPage)` 단일 상태 → progress·페이지·disabled 파생 |
| **모달 SSOT 추출** | `#modal-context` (作品コンテキスト 공통 모달) — `js/components/modal-context.js` 의 `MODAL_HTML` template literal 이 단일 진실의 원천. DOMContentLoaded 시 `body` 끝에 innerHTML 주입(이미 존재하면 skip). 8개 페이지(workroom / workspace / workspace-onboarding / series-edit / series-register / series-post-management / series-post-management-empty / account-setting)에서 마크업 복제 없이 공유 | React: 공용 `<ContextModal />` 컴포넌트로 1회 정의, 트리거는 `data-modal-open="#modal-context"` 속성으로 통일 |
| **모달 탭 동기화** | step 2 의 두 번째 탭 클릭 → step 이동 없이 step 3 의 동일 탭 콘텐츠를 그 자리에서 노출. `js/components/modal.js` 의 `selectTab()` 이 backdrop 안의 모든 `.tab-group` 을 동시 갱신해, step 3 에서 다른 탭으로 바꾸고 뒤로 가도 step 2 가 비어 보이지 않음 | shadcn `Tabs` 사용 시 동일 `value` 를 두 탭 그룹이 공유하도록 controlled state 로 |
| **outset effects 패턴 정착** | focus ring·shadow 등 박스 밖으로 나가는 효과는 **"스크롤 컨테이너가 카드보다 넓고 카드는 padding-inline 으로 인셋"** 구조로 처리(account-setting / modal__list 기준). 음수 마진·카드 폭 축소·inset outline 금지. `CLAUDE.md` 규칙 13 으로 명문화 | React: 스크롤 컨테이너의 `padding-inline` 을 카드 ring-width(3px) 이상으로 두면 outset ring 이 자연스럽게 살아남음 |
| **신규 에셋** | `img/img_viewer_page01.png` (viewer-yoko 데모 페이지) | public/ 으로 그대로 이관 |
| **인덱스 갱신** | `index.html` 에 viewer-yoko 항목(팝업 새창 1920×1080) + main-home / series-edit / viewer-yoko 상태 ✅ 로 변경 + 버전 라벨 v1.05.8 | (개발 영향 없음, 디자인 인덱스용) |

**하위 호환**
- 기존 토큰·클래스·BEM 구조 변경 없음
- 신규 CSS 컴포넌트 0개 (`#modal-context` 는 기존 `modal` 컴포넌트의 SSOT 인스턴스로 추출만, cva 추가 불필요)
- 모달이 들어가는 8개 페이지는 인라인 모달 마크업 → `<script src="js/components/modal-context.js" defer>` 로 교체됨 — 마크업 변화는 결과물 동일

**확인할 곳**
1. [`CHANGELOG.md`](./CHANGELOG.md) v1.05.8 항목 — **개발 액션 요약**
2. `viewer-yoko.html` + `css/pages/viewer-yoko.css` + `js/pages/viewer-yoko.js` — aria 단일 소스 + 슬라이드 트랜지션 + chrome 토글 패턴
3. `js/components/modal-context.js` — 공용 모달 SSOT 패턴
4. `CLAUDE.md` 규칙 13 — outset effects 구조 패턴 (개발 시 동일 원칙 적용)

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
