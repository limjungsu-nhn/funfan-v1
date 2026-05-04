/* viewer-tate.html — 縦読み 스크롤 뷰어
   책임:
     1. main 스크롤 위치 → progress-bar width(--progress) + aria-valuenow 동기화
     2. main 콘텐츠 클릭(non-scroll tap) → chrome(progress/header/footer) 토글
     3. 스크롤 끝의 .viewer-end 종료 화면에서 「水をあげて応援する」 버튼 클릭 시 #modal-water-support 모달 오픈
*/
(function () {
  const root = document.querySelector('.viewer-tate');
  if (!root) return;

  const progress = root.querySelector('.viewer-tate__progress');
  const main = root.querySelector('.viewer-tate__main');
  if (!progress || !main) return;

  // ─── 종료 화면 「水をあげて応援する」 버튼 → 모달 오픈 ───
  function openEndModal() {
    const backdrop = document.querySelector('#modal-water-support');
    if (!backdrop) return;
    backdrop.classList.add('modal-backdrop--open');
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new Event('viewer-tate:open-water-support'));
  }
  const waterBtn = root.querySelector('[data-viewer-end-water]');
  if (waterBtn) waterBtn.addEventListener('click', openEndModal);
  const nextBtn = root.querySelector('[data-viewer-end-next]');
  if (nextBtn) nextBtn.addEventListener('click', () => window.close());

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
    // 종료 화면 버튼 클릭만 chrome 토글 대상에서 제외 (텍스트·빈 영역은 일반 토글 동작)
    if (e.target.closest('.viewer-end__actions button')) return;
    root.classList.toggle('viewer-tate--chrome-hidden');
  });
})();
