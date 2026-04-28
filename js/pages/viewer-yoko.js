/* viewer-yoko.html — 横読み 뷰어
   책임:
     1. 진행 상태 단일 소스: .viewer-yoko__progress 의 aria-valuenow/min/max
     2. progress-bar 너비(--progress) + 페이지 인디케이터 + nav 버튼 disabled 동기화
     3. 좌/우 nav 클릭 → 페이지 +/- + 슬라이드(퇴장 + 등장) 애니메이션
     4. 콘텐츠 영역 클릭 → 상하 chrome(progress/header/footer) 토글
*/
(function () {
  const root = document.querySelector('.viewer-yoko');
  if (!root) return;

  const progress = root.querySelector('.viewer-yoko__progress');
  const stage = root.querySelector('.viewer-yoko__stage');
  const content = root.querySelector('.viewer-yoko__content');
  const nextBtn = root.querySelector('.viewer-yoko__nav--next');
  const prevBtn = root.querySelector('.viewer-yoko__nav--prev');
  const currentEl = root.querySelector('.viewer-yoko__page-current');
  const totalEl = root.querySelector('.viewer-yoko__page-total');

  function readState() {
    const min = Number(progress.getAttribute('aria-valuemin')) || 1;
    const max = Number(progress.getAttribute('aria-valuemax')) || min;
    const now = Number(progress.getAttribute('aria-valuenow')) || min;
    return { min, max, now };
  }

  function syncProgress() {
    const { min, max, now } = readState();
    const ratio = max > min ? (now - min) / (max - min) : 0;
    progress.style.setProperty('--progress', (ratio * 100) + '%');
    if (currentEl) currentEl.textContent = String(now);
    if (totalEl) totalEl.textContent = '/' + String(max);
    if (nextBtn) nextBtn.disabled = now >= max;
    if (prevBtn) prevBtn.disabled = now <= min;
  }

  function setPage(delta) {
    const { min, max, now } = readState();
    const next = Math.min(max, Math.max(min, now + delta));
    if (next === now) return false;
    progress.setAttribute('aria-valuenow', String(next));
    syncProgress();
    return true;
  }

  let animating = false;

  function slide(direction) {
    if (animating || !stage) return;
    const current = stage.querySelector('.viewer-yoko__image-wrap');
    if (!current) return;

    const exitCls = 'viewer-yoko__image-wrap--exit-to-' + (direction === 'next' ? 'right' : 'left');
    const enterCls = 'viewer-yoko__image-wrap--enter-from-' + (direction === 'next' ? 'left' : 'right');

    const incoming = current.cloneNode(true);
    incoming.classList.add(enterCls);
    stage.appendChild(incoming);
    current.classList.add(exitCls);

    animating = true;
    current.addEventListener('animationend', function cleanup() {
      current.removeEventListener('animationend', cleanup);
      current.remove();
      incoming.classList.remove(enterCls);
      animating = false;
    });
  }

  function bindNav() {
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled && setPage(1)) slide('next');
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!prevBtn.disabled && setPage(-1)) slide('prev');
      });
    }
  }

  function bindChromeToggle() {
    if (!content) return;
    content.addEventListener('click', () => {
      root.classList.toggle('viewer-yoko--chrome-hidden');
    });
  }

  function init() {
    syncProgress();
    bindNav();
    bindChromeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
