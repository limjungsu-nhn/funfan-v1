/* viewer-tate.html — 縦読み 스크롤 뷰어
   책임:
     1. main 스크롤 위치 → progress-bar width(--progress) + aria-valuenow 동기화
     2. main 콘텐츠 클릭(non-scroll tap) → chrome(progress/header/footer) 토글
*/
(function () {
  const root = document.querySelector('.viewer-tate');
  if (!root) return;

  const progress = root.querySelector('.viewer-tate__progress');
  const main = root.querySelector('.viewer-tate__main');
  if (!progress || !main) return;

  function syncProgress() {
    const max = main.scrollHeight - main.clientHeight;
    const ratio = max > 0 ? main.scrollTop / max : 0;
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    progress.style.setProperty('--progress', pct + '%');
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  main.addEventListener('scroll', syncProgress, { passive: true });
  window.addEventListener('resize', syncProgress);
  syncProgress();

  // tap-to-toggle chrome — 스크롤 드래그와 구분하기 위해 이동량 임계값 사용
  let downY = null;
  let downX = null;
  main.addEventListener('pointerdown', (e) => {
    downY = e.clientY;
    downX = e.clientX;
  });
  main.addEventListener('pointerup', (e) => {
    if (downY === null) return;
    const dy = Math.abs(e.clientY - downY);
    const dx = Math.abs(e.clientX - downX);
    downY = downX = null;
    if (dy > 6 || dx > 6) return; // 스크롤로 간주
    root.classList.toggle('viewer-tate--chrome-hidden');
  });
})();
