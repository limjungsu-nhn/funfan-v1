/* ============================================
   Accordion Row — 클릭 토글 (순수 CSS 애니메이션)

   애니메이션은 전적으로 CSS(grid-template-rows 0fr↔1fr)가 담당.
   JS 역할은 오직:
     - 헤더 클릭 → .accordion-row--active 토글
     - aria-expanded 동기화
   측정(scrollHeight/getBoundingClientRect) 불필요 → 끝 튐/시작 stutter 원천 제거.
   ============================================ */

(function () {
  'use strict';

  function onHeaderClick(event) {
    const header = event.currentTarget;
    const row = header.closest('[data-accordion]');
    if (!row) return;

    const willOpen = !row.classList.contains('accordion-row--active');
    row.classList.toggle('accordion-row--active', willOpen);
    header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  function init(root) {
    const scope = root || document;
    const rows = scope.querySelectorAll('[data-accordion]');
    rows.forEach((row) => {
      const header = row.querySelector('.accordion-row__header');
      if (!header || header.dataset.accordionBound === '1') return;
      header.dataset.accordionBound = '1';
      header.addEventListener('click', onHeaderClick);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  // 동적 삽입 시 외부에서 재초기화 가능
  window.AccordionRow = { init };
})();
