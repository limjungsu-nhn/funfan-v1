# FunFan v1.0 — 네이밍·규칙

프로토타입의 네이밍과 패턴. Shadcn/Tailwind 재구현 시 **왜 이렇게 되어 있는지** 이해하는 데 필요.

---

## 1. CSS 네이밍 — BEM 기반

### 기본 구조
```
.block                 → 컴포넌트 루트
.block__element        → 자식 요소
.block--modifier       → 변형(variant/size/state)
.block__element--mod   → 자식 요소의 변형
```

### 실제 예시
```
.btn                       ← 루트
.btn-line                  ← variant (line, ghost, filled-nature...)
.btn--sm / .btn--lg        ← size modifier
.btn-line--hover           ← state modifier (reference 전용)

.chat-msg                  ← 루트
.chat-msg__header          ← 자식
.chat-msg__body
.chat-msg__text
.chat-msg--new             ← 애니메이션 발동 state
```

### 예외 허용
- variant가 많은 경우 `btn-line`, `btn-ghost`처럼 **더블 하이픈 없이** 1단어로 뒤에 붙임 (읽기 편의)
- 정식 BEM의 `btn--line`보다 `btn-line`을 우선

---

## 2. 상태 클래스 철학 (중요)

### Reference 표기용 vs 런타임
| 클래스 | 용도 | 예시 |
|---|---|---|
| `.btn-line--hover` | **styleguide에서 hover 모양 정적 렌더용** | `<button class="btn btn-line btn-line--hover">` |
| `:hover` | **실제 런타임 동작** | 브라우저가 자동 트리거 |

**이유**: styleguide.html에서 hover/focus/pressed 각 상태를 **동시에 나란히** 보여주려면 정적 클래스가 필요.

### 구현 패턴
```css
.btn-line--hover,
.btn-line:hover:not(.btn-line--disabled) {
  /* 동일 스타일 */
}
```

두 셀렉터를 같이 적어서 **reference와 런타임이 동일한 비주얼**을 공유.

### focus ring 특수 케이스
```css
.btn-line--focus {
  /* reference — ring 포함 */
}
.btn-line:focus-visible:not(.btn-line--disabled) {
  /* 런타임 — ring 포함, 키보드만 */
}
```

`:focus-visible`이 `<button>`에서는 마우스 클릭 시 ring을 안 보여주지만,
`<input>`/`<textarea>`는 마우스 클릭에도 ring이 나타남 → `body.using-mouse` 패턴 추가 필요.

---

## 3. 토큰 네이밍

### 색상 — `--color-{category}-{scale}`
```
--color-nature-1     (가장 진함)
--color-nature-6     (가장 연함)
--color-gray-1 ~ 6   (Apple HIG 계열)
--color-white-100 / 50 / 30 / 0  (투명도)
--color-font-primary-black-100
--color-shadow-subtle / light / mid
```

### 간격 — 두 축으로 분리
| 접두어 | 용도 | 예시 |
|---|---|---|
| `--space-{n}` | **컴포넌트 내부** 절대값 (px) | `gap: var(--space-2)` |
| `--p{n}` | **페이지 레벨** 1440 퍼센트 | `width: var(--p20)` (288px) |

**왜 분리?**
- 컴포넌트는 "버튼 내부 간격 8px" 같은 고정값
- 페이지는 "좌측 패널 20%" 같은 퍼센트 개념
- 둘을 섞으면 반응형 확장 시 혼란

### 타이포그래피 — `.text-{scale}-{weight}`
```
.text-overline-w4     (11px / 400)
.text-caption-w6      (12px / 600)
.text-body-md-w4      (16px / 400)  ← body 기본
.text-h1-w6           (36px / 600)
.text-display1-w4     (72px / 400)
```

scale 14종 × weight 2종 = 28개 유틸리티.

### 기타
```
--base: 1440px              (페이지 최소 너비)
--navbar-height: 64px
--ring-width: 3px
--font-family-base
```

---

## 4. 파일 구조 규칙

### 컴포넌트 1:1
- 하나의 CSS 파일 = 하나의 컴포넌트
- 파일명 = BEM 루트 클래스
- `css/components/button.css` ↔ `.btn`

### 토큰 파일 분리
- `color.css` — 색상만
- `layout.css` — 간격/크기/ring
- `typography.css` — 폰트

### JS 모듈
- `js/core/` — 모든 페이지 공용 (focus ring 등)
- `js/components/` — 특정 컴포넌트 전용 (chat, stat-card)

---

## 5. HTML 패턴

### icon-only 버튼
```html
<button class="btn btn-glass btn--lg" type="button" aria-label="일시정지">
  <i class="icon icon-pause"></i>
</button>
```
- `type="button"` (form submit 방지)
- `aria-label` 필수 (텍스트 없으므로)

### icon + text 버튼
```html
<button class="btn btn-line">
  <i class="icon icon-edit"></i>
  <span class="text-assist-w4">編集</span>
</button>
```
- `<span>`에 타이포 유틸리티 적용
- aria-label 불필요 (텍스트가 레이블 역할)

### input + label (radio-card)
```html
<label class="radio-card">
  <input type="radio" class="radio-card__input" name="mode" value="public">
  <div class="radio-card__avatar">👀</div>
  <div class="radio-card__body">...</div>
</label>
```
- `<label>`로 전체 래핑 → 어떤 부분을 클릭해도 활성화
- aria 추가 불필요

### chat-msg
```html
<div class="chat-msg chat-msg--new">
  <div class="chat-msg__header">
    <i class="avatar avatar-02 avatar--sm"></i>
  </div>
  <div class="chat-msg__body">
    <p class="chat-msg__text">テキスト</p>
  </div>
</div>
```
- **신규 메시지만** `--new` 추가 → 아바타 spring 애니메이션 발동
- 기존 메시지(페이지 로드 시)는 `--new` 없이 — 애니메이션 없음

---

## 6. JavaScript 패턴

### 모듈 네임스페이스
```js
window.Chat = {
  typeText, appendBotMessage, appendMyMessage, setup
};
```
- 전역 하나만 노출
- 프로토에서 ES module 미사용 (브라우저 직접 실행)

### DOMContentLoaded 가드
```js
document.addEventListener('DOMContentLoaded', () => {
  Chat.setup({ root: ..., getReply });
});
```
- **이유**: `chat.js`가 `defer`로 로드되므로 HTML 파싱 완료 시점 필요

### IIFE 패턴
```js
(() => {
  const el = document.querySelector('.foo');
  if (!el) return; // 가드
  // ...
})();
```
- 전역 오염 방지
- 요소 부재 시 조용히 종료

---

## 7. 애니메이션 타이밍

| 목적 | duration | easing |
|---|---|---|
| 버튼 press scale | 80ms | `ease-in` |
| hover 전환 | 100ms | 기본 |
| 패널/상태 collapse | 220ms | `ease` |
| 채팅 스트리밍 | 30ms/글자 | — |
| 채팅 답변 지연 | 400ms | — |

---

## 8. 접근성 규칙

### 필수
- icon-only 버튼 → `aria-label`
- textarea/input 레이블 없으면 → `aria-label`
- focus는 Tab에서만 ring 표시

### 키보드 내비게이션
- `tabindex="-1"`: styleguide의 reference 복제본에 적용 (실제 포커스 이동 제외)
- `readonly`: reference 목적의 disabled input

### aria-live
- 프로토는 미적용
- 개발 시 채팅 메시지 영역에 `aria-live="polite"` 검토 권장

---

## 9. 금지 사항

- ❌ **인라인 `style="..."`**
- ❌ **하드코딩된 px/rgba** (토큰화 대체)
- ❌ **페이지 전용 임시 CSS 클래스** 신규 생성
- ❌ **마우스 클릭 시 focus ring**
- ❌ **1440px 미만 반응형 축소**

---

## 10. 허용 예외

- styleguide의 **색상/크기 시각화용** inline style (데모 목적)
- SVG defs(`<svg class="svg-defs">`) 같은 명확한 utility 클래스
- `!important`는 `[hidden]` 속성 덮어쓰기용으로만 허용
