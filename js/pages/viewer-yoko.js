/* viewer-yoko.html — 横読み 뷰어
   책임:
     1. 진행 상태 단일 소스: .viewer-yoko__progress 의 aria-valuenow/min/max
     2. progress-bar 너비(--progress) + 페이지 인디케이터 + nav 버튼 disabled 동기화
     3. 좌/우 nav 클릭 → 페이지 +/- + 슬라이드(퇴장 50% 시점에 입장 시작) 애니메이션
     4. 페이지 패리티에 따라 spread 이미지 src 교체 (홀수 = 01·02, 짝수 = 03·04)
     5. 콘텐츠 영역 클릭 → 상하 chrome(progress/header/footer) 토글
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

  // 페이지 패리티에 따라 스프레드 이미지 결정
  // 홀수 페이지 → kurokage_01 + 02, 짝수 페이지 → kurokage_03 + 04
  function pageImages(pageNum) {
    return pageNum % 2 === 1
      ? ['img/img_viewer_kurokage_01.jpg', 'img/img_viewer_kurokage_02.jpg']
      : ['img/img_viewer_kurokage_03.jpg', 'img/img_viewer_kurokage_04.jpg'];
  }

  function applyPageImages(spread, pageNum) {
    const imgs = spread.querySelectorAll('.viewer-yoko__image');
    const srcs = pageImages(pageNum);
    imgs.forEach((img, i) => { if (srcs[i]) img.src = srcs[i]; });
  }

  let animating = false;

  function slide(direction) {
    if (animating || !stage) return;
    const current = stage.querySelector('.viewer-yoko__spread');
    if (!current) return;

    const exitCls = 'viewer-yoko__spread--exit-to-' + (direction === 'next' ? 'right' : 'left');
    const enterCls = 'viewer-yoko__spread--enter-from-' + (direction === 'next' ? 'left' : 'right');

    animating = true;
    current.classList.add(exitCls);

    // 퇴장 50% 시점에 입장 시작 — 퇴장 듀레이션의 절반만큼 지연
    const styles = getComputedStyle(stage);
    const durMs = parseFloat(styles.getPropertyValue('--transition-slide-out-ms')) || 800;

    setTimeout(() => {
      const incoming = current.cloneNode(true);
      incoming.classList.remove(exitCls);
      incoming.classList.add(enterCls);
      applyPageImages(incoming, readState().now);
      stage.appendChild(incoming);
      incoming.addEventListener('animationend', function onEnter() {
        incoming.removeEventListener('animationend', onEnter);
        incoming.classList.remove(enterCls);
        animating = false;
      });
    }, durMs * 0.5);

    current.addEventListener('animationend', function onExit() {
      current.removeEventListener('animationend', onExit);
      current.remove();
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
    const initialSpread = stage && stage.querySelector('.viewer-yoko__spread');
    if (initialSpread) applyPageImages(initialSpread, readState().now);
    bindNav();
    bindChromeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
