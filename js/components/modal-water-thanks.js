/**
 * modal-water-thanks — 「水をあげて応援する」 thanks 모달의 비주얼 시퀀스 (Lottie 기반, v1.07.4).
 *
 * 외부 API:
 *   WaterThanks.start(thanksModal)  // Lottie 재생 시작 (모달이 active 가 되는 시점에 호출)
 *   WaterThanks.cancel()            // 진행 중 시퀀스 cancel (auto-close timer + Lottie destroy)
 *   WaterThanks.reset(backdrop)     // 초기 상태로 복귀 (Lottie destroy)
 *
 * 시퀀스 구성 (모달 오픈 = t=0):
 *   - Lottie 애니메이션 (`img/animations/watering.js` 가 window.WATERING_LOTTIE_DATA 로 노출) — 물주기 비주얼 일체 (텍스트 포함)
 *   - Lottie 자연 종료(`complete` 이벤트) → 자동 닫기 버튼 click → garden bloom 트리거
 *
 * Lottie 통합:
 *   - `lottie-web@5.12` (cdnjs) 가 `window.lottie` 전역 노출
 *   - `img/animations/watering.js` 가 `window.WATERING_LOTTIE_DATA` 로 JSON 노출
 *     (file:// 프로토콜에서 path 옵션이 fetch 차단되므로 animationData 사용)
 *   - thanksModal 안 `[data-lottie-container]` 에 svg 렌더
 *   - start 마다 destroy → 새 인스턴스 생성 (메모리 정리 + 깨끗한 t=0 재시작)
 */
(function () {
  'use strict';

  let lottieInstance = null;
  let cancels = [];

  /** Lottie 인스턴스 생성/재생. 기존 인스턴스가 있으면 destroy 후 새로 생성.
      file:// 프로토콜에서 path 옵션은 fetch 차단되므로 animationData (사전 로드된 객체) 사용. */
  function loadLottie(thanksModal) {
    const container = thanksModal.querySelector('[data-lottie-container]');
    if (!container || typeof window.lottie === 'undefined') return null;
    const data = window.WATERING_LOTTIE_DATA;
    if (!data) {
      console.warn('[modal-water-thanks] WATERING_LOTTIE_DATA not loaded. Ensure <script src="img/animations/watering.js"> precedes this script.');
      return null;
    }
    if (lottieInstance) {
      try { lottieInstance.destroy(); } catch (e) { /* noop */ }
      lottieInstance = null;
    }
    container.innerHTML = '';
    /* rendererSettings — hideOnTransparent: 투명 레이어 페인트 skip, progressiveLoad: false 로
       전체 frame 사전 마운트 (첫 프레임 jank 방지) */
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

  /** 시퀀스 시작 — thanks 모달이 active 가 되기 직전에 호출 */
  function start(thanksModal) {
    cancel();
    if (!thanksModal) return;

    // Lottie 시작 + 자연 종료 시점에 모달 close
    const anim = loadLottie(thanksModal);
    if (!anim) return;

    const onComplete = () => {
      const closeBtn = thanksModal.querySelector('[data-modal-close]');
      if (closeBtn) closeBtn.click();
    };
    anim.addEventListener('complete', onComplete);
    cancels.push(() => {
      try { anim.removeEventListener('complete', onComplete); } catch (e) { /* noop */ }
    });
  }

  /** 모달 reset (form 화면으로 복귀) — cancel 만 수행 */
  function reset(backdrop) {
    cancel();
  }

  window.WaterThanks = { start, cancel, reset };
})();
