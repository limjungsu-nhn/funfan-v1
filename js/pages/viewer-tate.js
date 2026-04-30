/* viewer-tate.html — 縦読み 스크롤 뷰어
   책임:
     1. main 스크롤 위치 → progress-bar width(--progress) + aria-valuenow 동기화
     2. 스크롤 끝(>=99%) 도달 시 #modal-water-support 자동 오픈 (viewer-koma 와 동일 모달)
     3. main 콘텐츠 클릭(non-scroll tap) → chrome(progress/header/footer) 토글
*/
(function () {
  const root = document.querySelector('.viewer-tate');
  if (!root) return;

  const progress = root.querySelector('.viewer-tate__progress');
  const main = root.querySelector('.viewer-tate__main');
  if (!progress || !main) return;

  // ─── 스크롤 끝 도달 시 모달 자동 오픈 ───
  // 최초: 끝(max) 도달 시 자동 오픈
  // 재오픈: 모달 닫힌 뒤, 끝에서 50vh 이상 위로 올라갔다가(=하단 50vh 여백이 시야에서 사라질 만큼) 다시 끝에 도달했을 때만
  let canOpen     = true;   // 다음 끝 도달 시 오픈 자격
  let modalIsOpen = false;  // 모달 표시 중

  function openEndModal() {
    const backdrop = document.querySelector('#modal-water-support');
    if (!backdrop) return;
    backdrop.classList.add('modal-backdrop--open');
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new Event('viewer-tate:open-water-support'));
  }

  // 모달 백드롭 class 변화 — 닫히면 modalIsOpen=false 로 되돌림 (canOpen 은 그대로 false 유지)
  const endBackdrop = document.querySelector('#modal-water-support');
  if (endBackdrop) {
    new MutationObserver(() => {
      modalIsOpen = endBackdrop.classList.contains('modal-backdrop--open');
    }).observe(endBackdrop, { attributes: true, attributeFilter: ['class'] });
  }

  function checkScrollEnd() {
    if (modalIsOpen) return;  // 표시 중에는 아무것도 하지 않음
    const max = main.scrollHeight - main.clientHeight;
    if (max <= 0) return;
    const halfVh = main.clientHeight * 0.5;
    const distFromBottom = max - main.scrollTop;

    // 닫힘 상태 + 50vh 이상 위로 스크롤 → 재오픈 자격 회복
    if (!canOpen && distFromBottom >= halfVh) {
      canOpen = true;
    }

    // 끝 도달 + 자격 있음 → 오픈
    if (canOpen && distFromBottom <= 1) {
      canOpen     = false;
      modalIsOpen = true;
      openEndModal();
    }
  }

  function syncProgress() {
    const max = main.scrollHeight - main.clientHeight;
    const ratio = max > 0 ? main.scrollTop / max : 0;
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    progress.style.setProperty('--progress', pct + '%');
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
    checkScrollEnd();
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
