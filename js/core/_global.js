/* ============================================
   Global Bootstrap — 모든 페이지가 공통 로드해야 하는 한 줄 진입점.

   사용법: 모든 .html <head>에 아래 한 줄 추가.
     <script src="js/core/_global.js" defer></script>

   포함 모듈:
     1. Keyboard Focus Indicator   (마우스/키보드 분기 — body.using-mouse)
     2. Input Container Focus Delegation  (wrapper 패딩/경계 클릭 → 내부 input/textarea 포커스)

   각 모듈은 IIFE 로 격리되어 충돌 없이 결합된다.
   ============================================ */

/* ============================================
   1) Keyboard Focus Indicator
   마우스 클릭 시 body.using-mouse 추가, Tab 누르면 제거.
   CSS: body:not(.using-mouse) .foo:focus-visible { ... }
   ============================================ */
(() => {
  document.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.remove('using-mouse');
  });
})();

/* ============================================
   2) Input Container Focus Delegation — 구조 기반 위임

   문제:
     wrapper 에 padding/visual border 가 있고 안의 input/textarea 가 그 영역을
     완전히 채우지 않을 때, 컨테이너의 padding/경계선을 클릭해도 포커스가 안 됨.

   해결:
     클릭 지점에서 위로 최대 3단계 올라가며 "단일 input/textarea 필드만 포함한
     가장 가까운 컨테이너"를 찾고, 클릭이 그 필드 바깥이라면 필드로 포커스를 위임.
     - 다중 필드 영역(폼 카드 등)은 모호하므로 자연 제외
     - depth 3 제한으로 페이지 전체까지 잡히지 않음
     - 직접 인터랙티브 요소 클릭은 패스 (브라우저 기본 동작 유지)
     - disabled/readonly 필드는 스킵
     - 새 컴포넌트도 동일 마크업이면 추가 작업 없이 자동 동작
   ============================================ */
(function () {
  const FIELD_SELECTOR =
    'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="image"]):not([type="range"]):not([type="color"]), textarea';
  const PASSTHROUGH = 'input, textarea, button, a, label, select, [contenteditable=""], [contenteditable="true"]';
  const MAX_DEPTH = 3;

  document.addEventListener('mousedown', (e) => {
    if (e.target.closest(PASSTHROUGH)) return;

    let el = e.target;
    for (let depth = 0; depth < MAX_DEPTH && el && el !== document.body; depth++, el = el.parentElement) {
      const fields = el.querySelectorAll(FIELD_SELECTOR);
      if (fields.length === 0) continue;
      if (fields.length > 1) return;

      const field = fields[0];
      if (field.disabled) return;

      const rect = field.getBoundingClientRect();
      const insideField =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (insideField) return;

      e.preventDefault();
      field.focus({ preventScroll: true });
      if (!field.readOnly) {
        const len = field.value.length;
        try { field.setSelectionRange(len, len); } catch (_) {}
      }
      return;
    }
  });
})();
