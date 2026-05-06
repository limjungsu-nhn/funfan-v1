/* ============================================
   Global Bootstrap — 모든 페이지가 공통 로드해야 하는 한 줄 진입점.

   사용법: 모든 .html <head>에 아래 한 줄 추가.
     <script src="js/core/_global.js" defer></script>

   포함 모듈:
     1. Keyboard Focus Indicator   (마우스/키보드 분기 — body.using-mouse)
     2. Input Container Focus Delegation  (wrapper 패딩/경계 클릭 → 내부 input/textarea 포커스)
     3. Viewer Popup (data-popup-viewer 속성 → viewer 미니 윈도우 1920×1080 오픈)

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

/* ============================================
   3) Viewer Popup — data-popup-viewer 기반 미니 윈도우 진입

   사용:
     <a href="viewer-yoko.html" data-popup-viewer="yoko">...</a>

   클릭 시 해당 viewer 페이지를 1920×1080 미니 윈도우로 오픈.
   동일 name 으로 호출 시 같은 창 재사용 (target name = `viewer-{kind}`).
   index.html 의 popup 링크와 동일한 사이즈/옵션.
   ============================================ */
(function () {
  const POPUP_W = 1920;
  const POPUP_H = 1080;

  function openPopup(href, name) {
    const x = (screen.availLeft || 0) + Math.max(0, (screen.availWidth - POPUP_W) / 2);
    const y = (screen.availTop || 0) + Math.max(0, (screen.availHeight - POPUP_H) / 2);
    window.open(
      href, name,
      'popup=yes,width=' + POPUP_W + ',height=' + POPUP_H +
      ',left=' + x + ',top=' + y +
      ',menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no'
    );
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-popup-viewer]');
    if (!link) return;
    /* 메타키 클릭(새 탭/창)은 브라우저 기본 동작 유지 */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const name = 'viewer-' + link.getAttribute('data-popup-viewer');
    openPopup(link.getAttribute('href'), name);
  });
})();
