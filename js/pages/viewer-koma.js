/* viewer-koma.html — コマ カルーセル 뷰어
   책임:
     1. 진행 상태 단일 소스: .viewer-koma__progress 의 aria-valuenow/min/max
     2. progress-bar 너비(--progress) + 페이지 인디케이터 + nav 버튼 disabled + dots active 동기화
     3. 좌/우 nav · dots 클릭 → 슬라이드 (트랙 transform 으로 두 이미지가 붙어 이동)
     4. 페이지 패리티(홀/짝)에 따라 KOMA_IMAGES 에서 src 자동 교체
     5. 스테이지 클릭 → chrome(progress/header/footer) 토글 (nav · dot 클릭은 제외)
*/
(function () {
  const root = document.querySelector('.viewer-koma');
  if (!root) return;

  const progress  = root.querySelector('.viewer-koma__progress');
  const stage     = root.querySelector('.viewer-koma__stage');
  const card      = root.querySelector('.viewer-koma__card');
  const cardTrack = root.querySelector('.viewer-koma__card-track');
  let   cardImage = root.querySelector('.viewer-koma__card-image');
  const nextBtn   = root.querySelector('.viewer-koma__nav--next');
  const prevBtn   = root.querySelector('.viewer-koma__nav--prev');
  const dots      = Array.from(root.querySelectorAll('.viewer-koma__dot'));
  const currentEl = root.querySelector('.viewer-koma__page-current');
  const totalEl   = root.querySelector('.viewer-koma__page-total');

  // 페이지별로 번갈아 가며 노출할 이미지 (홀수: koma_01, 짝수: koma_02)
  const KOMA_IMAGES = [
    'img/img_viewer_koma_01.png',
    'img/img_viewer_koma_02.png',
  ];

  function readState() {
    const min = Number(progress.getAttribute('aria-valuemin')) || 1;
    const max = Number(progress.getAttribute('aria-valuemax')) || min;
    const now = Number(progress.getAttribute('aria-valuenow')) || min;
    return { min, max, now };
  }

  // 페이지 번호 외 모든 UI 상태(progress / dots / nav disabled / page indicator / data-koma) 갱신.
  // 이미지 src 갱신은 별도 — slideTo 가 트랙 정리 후 cardImage 참조를 새 노드로 바꾸기 때문에
  // syncImage 는 초기 진입(init)에서만 사용된다.
  function syncState(targetNow) {
    const { min, max } = readState();
    const now = typeof targetNow === 'number' ? targetNow : readState().now;
    const ratio = max > min ? (now - min) / (max - min) : 0;
    progress.style.setProperty('--progress', (ratio * 100) + '%');
    if (currentEl) currentEl.textContent = String(now);
    if (totalEl)   totalEl.textContent   = '/' + String(max);
    // next 는 마지막 코마에서도 활성 — 클릭 시 종료 모달이 열림 (bindNav 참조)
    if (nextBtn)   nextBtn.disabled = false;
    if (prevBtn)   prevBtn.disabled = now <= min;
    if (card)      card.setAttribute('data-koma', String(now));
    dots.forEach((dot, i) => {
      const active = i === now - min;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function syncImage() {
    if (!cardImage) return;
    const { min, now } = readState();
    const src = KOMA_IMAGES[(now - min) % KOMA_IMAGES.length];
    if (src && cardImage.getAttribute('src') !== src) {
      cardImage.src = src;
      cardImage.alt = 'コマ ' + now;
    }
  }

  // ---------- Slide animation ----------
  let animating = false;

  function slideTo(targetPage) {
    if (animating || !cardTrack || !cardImage) return;
    const { min, max, now } = readState();
    const target = Math.min(max, Math.max(min, targetPage));
    if (target === now) return;

    const direction = target > now ? 'next' : 'prev';

    // 새 이미지 src 결정 (현재 holds-old, 새 이미지로 next 페이지 src 사용)
    const nextSrc = KOMA_IMAGES[(target - min) % KOMA_IMAGES.length];

    // 새 이미지 노드 생성
    const incoming = cardImage.cloneNode(false);
    incoming.src = nextSrc;
    incoming.alt = 'コマ ' + target;

    animating = true;

    // 진행 상태(progress / dots / page indicator) 는 슬라이드 시작과 동시에 갱신
    // 이미지 src 는 트랙 정리 후 incoming 으로 cardImage 참조가 자연 갱신됨
    progress.setAttribute('aria-valuenow', String(target));
    syncState(target);

    // 트랙 구성: next 이면 [현재][새], prev 이면 [새][현재] — 두 이미지가 붙어 함께 이동
    if (direction === 'next') {
      cardTrack.appendChild(incoming);
      // 현재 위치 0 → -100% (왼쪽으로 슬라이드, 새 이미지가 노출)
      cardTrack.style.transform = 'translateX(0)';
      void cardTrack.offsetWidth; // reflow 강제
      cardTrack.classList.add('viewer-koma__card-track--animating');
      cardTrack.style.transform = 'translateX(-100%)';
    } else {
      cardTrack.insertBefore(incoming, cardImage);
      // 트랜지션 없이 -100% 로 점프 (왼쪽에 새 이미지 숨김), 그다음 0 으로 슬라이드
      cardTrack.style.transition = 'none';
      cardTrack.style.transform  = 'translateX(-100%)';
      void cardTrack.offsetWidth;
      cardTrack.style.transition = '';
      cardTrack.classList.add('viewer-koma__card-track--animating');
      cardTrack.style.transform  = 'translateX(0)';
    }

    cardTrack.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'transform') return;
      cardTrack.removeEventListener('transitionend', onEnd);
      // 정리: 옛 이미지 제거, transform 초기화 (transition 도 일시 제거)
      cardTrack.classList.remove('viewer-koma__card-track--animating');
      cardImage.remove();
      cardImage = incoming;
      cardTrack.style.transform = 'translateX(0)';
      animating = false;
    });
  }

  function openEndModal() {
    const backdrop = document.querySelector('#modal-water-support');
    if (!backdrop) return;
    backdrop.classList.add('modal-backdrop--open');
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new Event('viewer-koma:open-water-support'));
  }

  function bindNav() {
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (animating) return;
        const { now, max } = readState();
        if (now >= max) {                  // 마지막 코마에서 next → 모달 오픈
          openEndModal();
          return;
        }
        slideTo(now + 1);
      });
    }
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (animating) return;
      slideTo(readState().now - 1);
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => slideTo(readState().min + i));
    });
  }

  function bindChromeToggle() {
    if (!stage) return;
    stage.addEventListener('click', (e) => {
      // nav 버튼 / dot / 그 자식 아이콘 클릭은 chrome 토글 대상에서 제외
      if (e.target.closest('.viewer-koma__nav, .viewer-koma__dot')) return;
      root.classList.toggle('viewer-koma--chrome-hidden');
    });
  }

  function init() {
    syncState();
    syncImage();
    bindNav();
    bindChromeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
