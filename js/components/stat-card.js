/* ============================================
   Stat Card — 숫자 카운팅 애니메이션

   사용법:
     숫자 요소에 data-count="숫자" 속성을 추가하면
     페이지 로드 시 0부터 자동으로 카운팅됩니다.

     접미사가 필요한 경우 data-suffix 속성을 추가합니다.

   예시:
     <span data-count="47">0</span>
     <span data-count="1203" data-suffix="円">0円</span>
   ============================================ */

(() => {
  const DURATION = 1200; // ms
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function runCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (target === 0) return;
    const suffix = el.dataset.suffix || '';
    const start = Date.now();
    const INTERVAL = 16; // ~60fps

    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / DURATION, 1);
      el.textContent = Math.round(easeOut(progress) * target).toLocaleString('ja-JP') + suffix;
      if (progress >= 1) clearInterval(timer);
    }, INTERVAL);
  }

  function init() {
    document.querySelectorAll('[data-count]').forEach(runCounter);
  }

  init();
})();
