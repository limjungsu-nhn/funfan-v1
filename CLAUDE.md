# FunFan v1.0 — Claude 작업 규칙

## 메타 규칙
사용자가 무언가를 지적하고 "하지 말라"고 하면 → 즉시 CLAUDE.md와 메모리에 기록할 것. 나중에 하지 말고 그 자리에서 바로.

## 작업 완료 전 필수 체크리스트

모든 코드 수정 후 다음을 반드시 확인할 것:

- [ ] CSS 수정 → styleguide.html 해당 컴포넌트 섹션 동기화했는가?
- [ ] workspace.html JS 추가 → styleguide.html `<script>`에도 동일하게 추가했는가?
- [ ] 새 CSS 파일 생성 → workspace.html AND styleguide.html 양쪽에 `<link>` 추가했는가?
- [ ] 새 컴포넌트 HTML 마크업 사용 → 해당 CSS 파일이 그 페이지에 링크되어 있는가?

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

### 6. styleguide 컴포넌트는 반드시 테이블 형식으로 등록
- 모든 컴포넌트는 `.sg-type-table` > `.sg-type-row` 구조로 등록
- 열 구성: Preview(`.sg-type-preview`) / Class(`.sg-type-classname`) / Notes(`.sg-type-meta`)
- `.sg-demo-canvas`는 인터랙티브 데모 전용 — 정적 컴포넌트 등록에는 사용 금지
