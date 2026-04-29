# FunFan v1.0 — Claude 작업 규칙

## 메타 규칙
사용자가 무언가를 지적하고 "하지 말라"고 하면 → 즉시 CLAUDE.md와 메모리에 기록할 것. 나중에 하지 말고 그 자리에서 바로.

## 작업 완료 전 필수 체크리스트

모든 코드 수정 후 다음을 반드시 확인할 것:

- [ ] CSS 수정 → styleguide.html 해당 컴포넌트 섹션 동기화했는가?
- [ ] workspace.html JS 추가 → styleguide.html `<script>`에도 동일하게 추가했는가?
- [ ] 새 CSS 파일 생성 → workspace.html AND styleguide.html 양쪽에 `<link>` 추가했는가?
- [ ] 새 컴포넌트 HTML 마크업 사용 → 해당 CSS 파일이 그 페이지에 링크되어 있는가?
- [ ] 새 컴포넌트 생성 → `handoff/COMPONENTS.md`에 항목 추가했는가?
- [ ] 새 기본 에셋(이미지/색상/아이콘/토큰) 추가 → styleguide.html 해당 Foundation 섹션에도 등록했는가?
- [ ] 새 페이지(.html) 생성 → `index.html`의 페이지 리스트에 항목 추가했는가?
- [ ] 새 페이지(.html) 생성 → `<script src="js/core/_global.js" defer></script>` 포함했는가? (키보드 포커스 + input 컨테이너 클릭 위임 공통 부트스트랩)

---

## 규칙

### 1. CSS가 유일한 진실 (source of truth)
- 모든 스타일은 반드시 CSS 파일의 클래스/변수에서 가져올 것
- 인라인 스타일(`style=""`) 금지
- 페이지 전용 임시 클래스 신규 생성 금지
- 필요한 스타일이 없으면 → CSS에 먼저 추가한 뒤 페이지에서 참조

### 2. 최소 페이지 너비 1440px
- 모든 페이지에 `min-width: var(--base)` 적용
- 반응형 축소 금지 — 1440px 미만 뷰포트에서는 가로 스크롤 허용
- `position: fixed` 요소(navbar 등)는 body `min-width`에 영향받지 않으므로 별도로 `min-width: var(--base)` 적용

### 7. 수치는 반드시 layout.css 토큰 사용
- 사용자가 "1440 기준 N%" 또는 "1440의 N%" 등으로 크기를 말하면 → `css/tokens/layout.css`에 등록된 `--p{n}` 변수 사용
- 하드코딩 금지: `288px` → `var(--p20)`, `576px` → `var(--p40)`, `72px` → `var(--p5)` 등
- 토큰에 없는 퍼센트가 필요하면 → `layout.css`에 먼저 추가한 뒤 사용
- 기준값: `--base: 1440px` / 토큰 파일: `css/tokens/layout.css`

### 3. 마우스 클릭 시 focus ring 금지
- 마우스 클릭으로 요소를 활성화할 때 focus ring(box-shadow) 표시 금지
- 키보드(Tab) 전용으로만 ring 표시
- `<button>`: CSS `:focus-visible`만으로 OK (브라우저가 키보드 전용 처리)
- `<textarea>` / `<input>`: 브라우저가 마우스에도 `:focus-visible` 강제 적용 → JS 패턴 필수
  ```js
  document.addEventListener('mousedown', () => document.body.classList.add('using-mouse'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.remove('using-mouse'); });
  ```
  ```css
  body:not(.using-mouse) .component:has(input:focus-visible) { /* ring */ }
  ```

### 4. 이벤트 있는 컴포넌트 → styleguide에 인터랙티브 데모 필수
- 클릭·호버·포커스 등 이벤트가 있는 컴포넌트는 styleguide.html에 `.sg-demo-canvas` 블록 필수
- 필요한 JS는 페이지 하단 `<script>`에 추가
- 데모 전용 스타일은 `styleguide.css`에 추가 (인라인 스타일 금지)

### 5. styleguide.html과 workspace.html 항상 동기화
- CSS 변경, JS 추가, 새 컴포넌트 등록 — 두 파일 모두 반영
- 한 파일만 수정하고 마무리하지 말 것
- **컴포넌트뿐 아니라 기본 에셋(이미지/색상/아이콘/토큰 등)도 등록 즉시 styleguide.html Foundation 섹션에 반영**
  - 이미지 → `#images` 섹션 (Backgrounds / Series Poster / Flowers 등 적절한 서브섹션)
  - 색상 → `#colors` 섹션
  - 아이콘 → `#icons` 섹션
  - 토큰 → `#layout` 섹션
  - 해당 섹션이 없으면 신설 + nav 링크 추가

### 6. styleguide 컴포넌트는 반드시 테이블 형식으로 등록
- 모든 컴포넌트는 `.sg-type-table` > `.sg-type-row` 구조로 등록
- 열 구성: Preview(`.sg-type-preview`) / Class(`.sg-type-classname`) / Notes(`.sg-type-meta`)
- `.sg-demo-canvas`는 인터랙티브 데모 전용 — 정적 컴포넌트 등록에는 사용 금지

### 8. 새 컴포넌트 생성 시 handoff/COMPONENTS.md 즉시 업데이트
- `css/components/` 또는 `js/components/`에 새 파일 생성 시 → `handoff/COMPONENTS.md`에도 항목 추가
- 기존 패턴 유지: `#### .component-name → shadcn ...` + 동작 메모 1~3줄
- 미정의 항목(클릭 동작, 애니메이션 스펙 등)은 `TODO:` 로 명시
- 나중에 몰아서 하지 말 것 — 작업 맥락이 살아있을 때 기록해야 디테일이 누락되지 않음
- `handoff/README.md`의 "N개 컴포넌트" 카운트도 함께 갱신

### 9. 핸드오프 파일별 싱크 규칙
코드 변경 시 아래 파일들을 **즉시** 업데이트 (몰아서 하지 말 것):

| 코드 변경 | 싱크 대상 |
|---|---|
| `css/components/*.css` 추가·삭제 | `handoff/COMPONENTS.md` (규칙 8) + `handoff/README.md` 카운트 |
| `css/components/icon.css`에 `.icon-*` 클래스 추가·삭제 | `handoff/ICONS.md` |
| `css/tokens/*.css` 변경 | `handoff/design-tokens.json` + `handoff/tailwind-preset.ts` 양쪽 |

나머지 문서(`ARCHITECTURE.md`, `CONVENTIONS.md`, `GETTING_STARTED.md`, `CHANGELOG.md`)는 수동 업데이트 — 네이밍 규칙·실행 방법·구조 재편 등 원칙 단위 변경 시에만 수정.

### 10. 컴포넌트/이미지 본래 사이즈 유지 (임의 축소 금지)
- 사용자가 지정한 컴포넌트 치수(예: 834×241)는 **설계 그대로 유지**
- styleguide preview 셀이 좁아서 overflow가 나더라도 `transform: scale()`, `zoom`, 축소된 `width`로 맞추지 말 것 — 이건 "두번 작업"을 유발함
- preview 셀 쪽을 조정해야 하면 셀의 `grid-template-columns`, `overflow`, 또는 스크롤을 바꿀 것 — 컴포넌트가 아닌 **환경**을 바꿀 것
- 이미지 등록 시에도 동일: 자산의 표시 치수를 임의로 줄이지 말 것

### 11. 시각적 검증은 사용자가 수행
- 작업 완료 후 `preview_screenshot` / `preview_snapshot`을 반복해 시각 확인을 하려 들지 말 것 — 사용자가 직접 브라우저에서 확인함
- 필요한 것만 확인: 컴포넌트 존재 여부, 링크/nav 등록 여부, 치수 계산 정도면 충분
- "검증 과정이 너무 길다"는 피드백이 나온 이상, 구조적 확인만 하고 바로 마무리할 것

### 12. 스스로 판단해서 실행 (매 단계 확인 금지)
- 사용자가 요청한 작업 범위 안의 세부 결정(네이밍, 구조 선택, 스타일 배치 등)은 **스스로 판단해서 바로 실행**
- "A·B·C 중 어떤 걸로?" 같은 옵션 나열 → 대기 루프를 기본값으로 삼지 말 것 — 흐름이 끊겨 비효율
- 결과물을 낸 뒤 "이대로 OK?" 확인은 허용. 단, **실행 전** 확인은 지양
- 여전히 **실행 전 확인이 필요한 경우**:
  1. **비가역·파괴적 작업**: 파일/브랜치 삭제, `git reset --hard`, force push, DB drop, 공유 리소스 변경
  2. **사용자 의도가 정반대로 갈릴 만큼 모호할 때**: 한쪽을 고르면 되돌리기 비싼 경우
  3. **스코프 확장**: 요청에 없던 리팩토링·구조 변경을 추가로 하려 할 때
- 위 3가지 외에는 **판단 → 실행 → 보고** 순으로 진행

### 13. 박스 밖으로 나가는 효과(focus ring, drop-shadow 등)는 "넓은 스크롤 컨테이너 + 카드 인셋" 패턴 사용
- 스크롤/clip 컨테이너 안쪽 요소에 outset focus ring·box-shadow 등 박스 경계를 넘는 효과가 있을 때 → **스크롤 컨테이너 폭 > 카드 폭** 이 되도록 구조를 잡을 것
- 기준 패턴(account-setting.html / modal__list):
  1. 부모(step/section/wrapper)의 가로 패딩 제거 → 스크롤 컨테이너가 edge-to-edge
  2. 카드와 형제인 다른 자식들(label/header/footer/summary 등)은 `margin-inline`으로 개별 인셋
  3. 스크롤 컨테이너에 `padding-inline: <inset>` → 내부 카드 시각 위치 유지, ring은 padding 영역 안에서 살아남음
- **금지**:
  - 음수 마진(`margin: -Npx`)으로 박스 밖 효과 살리기
  - 카드 폭 축소(`width: calc(100% - ...)`) — 다른 형제와 폭 불일치로 레이아웃 깨짐
  - inset outline (`outline-offset: -Npx`) — outset 표현 유지가 원칙
  - `overflow-clip-margin` 만으로 해결 시도 — 스크롤 축(`overflow: auto`)에서는 무효
- 이유: account-setting이 잘 작동한 본질은 clip-margin이 아니라 "스크롤 컨테이너가 카드보다 넓어 ring이 자연스럽게 경계 안쪽에 머문다"는 구조적 여유 때문.

### 14. "코드정리해줘" 명령 = 4-step 정리 루틴
사용자가 **"코드정리해줘"** 라고 하면 다음 4가지를 순서대로 점검·수정:
1. **CSS 동기화** — 최근 변경된 CSS 컴포넌트가 styleguide.html / workspace.html / 사용 페이지(.html)에 모두 반영되어 있는지 확인 (`<link>` 누락, 마크업 mismatch 등)
2. **스타일 가이드 점검** — 새/변경 컴포넌트가 styleguide.html에 테이블 형식으로 등록되어 있는지, 인터랙티브 컴포넌트는 `.sg-demo-canvas` 데모가 있는지, Foundation 섹션 누락은 없는지
3. **하드코딩 제거** — `style=""` 인라인, 색상/사이즈 리터럴(`#fff`, `288px` 등)을 토큰(`var(--color-*)`, `var(--p{n})`, `var(--space-*)`)으로 치환. 임시 클래스 → 공식 컴포넌트 클래스로 정리
4. **코드 정리** — 죽은 코드/주석/콘솔로그 제거, 중복 셀렉터 통합, 들여쓰기/공백 일관성, BEM 네이밍 컨벤션 준수 확인

- 4단계 모두 실행 후 변경사항을 한 메시지로 요약 보고
- 각 step 에서 발견된 문제만 수정 — 문제 없으면 "OK" 로 표시
