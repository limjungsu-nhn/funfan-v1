/**
 * modal-sprout-grow — 「投稿する」 버튼 클릭 시 새싹 피어남 Lottie 비주얼 (v1.07.6).
 *
 * 외부 API:
 *   SproutGrow.start(modal)   // Lottie 재생 시작 (모달이 active 가 되는 시점에 호출)
 *   SproutGrow.cancel()       // 진행 중 시퀀스 cancel (Lottie destroy)
 *   SproutGrow.reset(backdrop)// 초기 상태로 복귀 (Lottie destroy)
 *
 * 시퀀스 구성:
 *   - Lottie 애니메이션 (`img/animations/sprout.js` 가 window.SPROUT_LOTTIE_DATA 로 노출)
 *     1008×900, 100fps × 400 frames = 4s — 새싹 피어남 비주얼 일체
 *   - Lottie 자연 종료(`complete` 이벤트) → 자동 닫기 버튼 click → modal close → page redirect
 *
 * Lottie 통합:
 *   - `lottie-web@5.12` (cdnjs) 가 `window.lottie` 전역 노출
 *   - `img/animations/sprout.js` 가 `window.SPROUT_LOTTIE_DATA` 로 JSON 노출
 *     (file:// 프로토콜에서 path 옵션이 fetch 차단되므로 animationData 사용)
 *   - modal 안 `[data-sprout-lottie-container]` 에 svg 렌더
 *   - start 마다 destroy → 새 인스턴스 생성 (메모리 정리 + 깨끗한 t=0 재시작)
 *
 * 페이지 적용: episode-add{,-koma,-tate,-yoko}.html — `投稿する` 버튼이 모달 트리거
 */
(function () {
  'use strict';

  let lottieInstance = null;
  let cancels = [];

  /** Lottie 인스턴스 생성/재생. 기존 인스턴스가 있으면 destroy 후 새로 생성. */
  function loadLottie(modal) {
    const container = modal.querySelector('[data-sprout-lottie-container]');
    if (!container || typeof window.lottie === 'undefined') return null;
    const data = window.SPROUT_LOTTIE_DATA;
    if (!data) {
      console.warn('[modal-sprout-grow] SPROUT_LOTTIE_DATA not loaded. Ensure <script src="img/animations/sprout.js"> precedes this script.');
      return null;
    }
    if (lottieInstance) {
      try { lottieInstance.destroy(); } catch (e) { /* noop */ }
      lottieInstance = null;
    }
    container.innerHTML = '';
    lottieInstance = window.lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: false,
        hideOnTransparent: true,
      },
    });
    return lottieInstance;
  }

  function cancel() {
    cancels.forEach((c) => c());
    cancels = [];
    if (lottieInstance) {
      try { lottieInstance.destroy(); } catch (e) { /* noop */ }
      lottieInstance = null;
    }
  }

  /** 시퀀스 시작 — 모달이 active 가 되기 직전에 호출 */
  function start(modal) {
    cancel();
    if (!modal) return;

    const anim = loadLottie(modal);
    if (!anim) return;

    /* Lottie 자연 종료 → 1s 여유 hold → 자동 close 버튼 click → 페이지의 click 핸들러가 redirect 수행 */
    const HOLD_AFTER_COMPLETE_MS = 1000;
    let holdTimer = null;
    const onComplete = () => {
      holdTimer = setTimeout(() => {
        const closeBtn = modal.querySelector('[data-modal-close]');
        if (closeBtn) closeBtn.click();
      }, HOLD_AFTER_COMPLETE_MS);
    };
    anim.addEventListener('complete', onComplete);
    cancels.push(() => {
      try { anim.removeEventListener('complete', onComplete); } catch (e) { /* noop */ }
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    });
  }

  /** 모달 reset — cancel 만 수행 */
  function reset(backdrop) {
    cancel();
  }

  window.SproutGrow = { start, cancel, reset };
})();
