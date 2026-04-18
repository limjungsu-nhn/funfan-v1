/* ============================================
   Keyboard Focus Indicator
   ---------------------------------------------
   마우스 클릭 시 body에 .using-mouse 클래스를 붙이고,
   Tab 키를 누르면 제거해서 focus ring을
   키보드 사용 시에만 노출하기 위한 전역 스크립트.

   사용법: 모든 페이지 <head>에 아래 한 줄 추가.
     <script src="js/core/keyboard-focus.js" defer></script>

   CSS에서:
     body:not(.using-mouse) .foo:focus-visible { ... }
   ============================================ */

(() => {
  document.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.remove('using-mouse');
  });
})();
