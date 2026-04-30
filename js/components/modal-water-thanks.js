/**
 * modal-water-thanks — 「水をあげて応援する」 thanks 모달의 8s 비주얼 시퀀스.
 *
 * 외부 API:
 *   WaterThanks.start(thanksModal)  // 시퀀스 시작 (모달이 active 가 되는 시점에 호출)
 *   WaterThanks.reset(backdrop)     // 모든 사이클 cancel + illust/overlay/title 초기 상태로 복귀
 *
 * 시퀀스 구성 (모달 오픈 = t=0):
 *   - plant drop 5회 착지 (t=2/3.5/5/6.5/8s)  + splash-pop
 *   - ground drop 20개 taper 분배 (t=1s 시작 ~ 8s 종료) + 가운데 편향 + X 회피 + wet-spot
 *   - 새싹 일러스트 단계 전환 (183 → 184 → 186 → 187, t=2/3.5/5s)
 *   - 오버레이 일러스트 (185 → 188 → 189, t=2/3.5/5s)
 *   - 타이틀 3단계 typewriter type-in/erase (t=0/2.667/5.333s)
 *   - t=9s: thanks 모달 닫기 버튼 자동 클릭
 *
 * 최적화:
 *   - drop 마다 cloneNode-replaceWith 대신 단일 element 에 inline animation
 *     재할당으로 사이클 재시작 (DOM 생성/제거 비용 제거)
 *   - DOM 노드는 HTML 마크업의 원본 element 만 사용. wet-spot 만 동적 생성
 */
(function () {
  'use strict';

  // 시퀀스 타이밍 상수 (모달 오픈 = t=0 기준 ms)
  const PRE_DELAY = 1000;            // ground 첫 시작 시점
  const ANIM_DURATION = 8000;        // 전체 재생 시간
  const TAPER_START = 3200;          // ground drop 들이 순차 정지 시작 시점 (taper)
  const AUTO_CLOSE_AT = 9500;        // 모달 자동 닫기 시점 (재생 종료 + 1.5s)

  // 자산 경로
  const DROP_SRC = 'img/img_water_drop_176.svg';
  const SPLASH_SRC = 'img/img_water_splash.svg';

  // 새싹 + 오버레이 단계 (at: ms, illustSrc / overlaySrc, overlayShow: 첫 단계만 true)
  const ILLUST_STAGES = [
    { at: 2000, illustSrc: 'img/img_illust_184.svg', overlaySrc: 'img/img_illust_185.svg', overlayShow: true },
    { at: 3500, illustSrc: 'img/img_illust_186.svg', overlaySrc: 'img/img_illust_188.svg' },
    { at: 5000, illustSrc: 'img/img_illust_187.svg', overlaySrc: 'img/img_illust_189.svg' },
  ];

  // 타이틀 단계 (5s 균등 3분할 → 8s 적용 시 0/2667/5333)
  const TITLE_STAGES = [
    { at: 0,    text: '花壇に水を届けています' },
    { at: 2667, text: '水滴がつぼみに向かっています' },
    { at: 5333, text: '花壇に変化が反映されました' },
  ];
  const TYPE_DUR = 500;              // type-in / erase 각 0.5s
  const INITIAL_TITLE = TITLE_STAGES[0].text;
  const INITIAL_ILLUST = 'img/img_illust_183.svg';

  // ground drop X 회피
  const MIN_X_DIST = 12;             // % (≈60px = splash 폭의 절반)
  const X_SAMPLE_TRIES = 12;

  let dropCycleCancels = [];

  /**
   * 단일 drop element 의 사이클을 시작.
   * cloneNode-replaceWith 없이 같은 element 에 animation 을 재할당해서 재시작.
   */
  function spawnDropCycle(initial, isGround, groundIdx, groundCount, startTime, activeXs, pickGroundX) {
    const cycleInterval = isGround ? 3000 : 1500;
    const stopTime = isGround
      ? TAPER_START + ((ANIM_DURATION - TAPER_START) * (groundIdx / Math.max(1, groundCount - 1))) + (Math.random() * 400 - 200)
      : 7000; // plant 6번째 차단 (5번째까지 허용)
    let timer = null;
    let cancelled = false;
    let cleanupTimers = []; // wet-spot remove / activeXs splice 등 사이클 종속 timer
    let lastChosenX = null;

    // animationend 리스너 — 매 사이클 water-drop-fall 종료 시 splash 전환.
    // 클로저로 lastChosenX / cleanupTimers 를 캡처.
    const onAnimEnd = (e) => {
      if (e.animationName !== 'water-drop-fall') return;
      const xCaptured = lastChosenX;
      lastChosenX = null;
      // inline animation 클리어 — CSS --landed 규칙의 water-splash-pop 0.2s 가 발동
      initial.style.animation = '';
      initial.src = SPLASH_SRC;
      initial.classList.add('modal-water-thanks__drop--landed');
      // 땅 wet-spot — ground 만
      if (isGround) {
        const wetSpot = document.createElement('div');
        wetSpot.className = 'modal-water-thanks__wet-spot modal-water-thanks__wet-spot--ground';
        wetSpot.style.left = initial.style.left;
        wetSpot.style.setProperty('--y-jitter', initial.style.getPropertyValue('--y-jitter'));
        initial.parentNode.insertBefore(wetSpot, initial);
        const t = setTimeout(() => wetSpot.remove(), 800);
        cleanupTimers.push(t);
      }
      // splash-pop 0.2s 후 X 회피 목록에서 제거
      if (xCaptured != null) {
        const t = setTimeout(() => {
          const idx = activeXs.indexOf(xCaptured);
          if (idx >= 0) activeXs.splice(idx, 1);
        }, 200);
        cleanupTimers.push(t);
      }
    };
    initial.addEventListener('animationend', onAnimEnd);

    const playOne = (firstDelay) => {
      if (cancelled) return;
      if (performance.now() - startTime >= stopTime) return;
      // 상태 리셋: src/landed/animation 초기화
      initial.classList.remove('modal-water-thanks__drop--landed');
      initial.src = DROP_SRC;
      initial.style.animation = 'none';
      // 위치 + jitter
      if (isGround) {
        lastChosenX = pickGroundX();
        initial.style.left = lastChosenX.toFixed(1) + '%';
        activeXs.push(lastChosenX);
        const offsetY = (Math.random() * 80 - 40).toFixed(1);
        initial.style.setProperty('--y-jitter', offsetY + 'px');
      } else {
        lastChosenX = null;
        const offsetX = (Math.random() * 80 - 40).toFixed(1);
        initial.style.left = 'calc(50% + ' + offsetX + 'px)';
      }
      // reflow 강제 후 inline animation 재할당 → 매 사이클 재시작
      void initial.offsetWidth;
      initial.style.animation = 'water-drop-fall 1s ease-in ' + (firstDelay || 0) + 'ms forwards';
      timer = setTimeout(() => playOne(0), (firstDelay || 0) + cycleInterval);
    };

    // 첫 사이클 stagger
    const initialDelay = isGround
      ? PRE_DELAY + Math.max(0, (cycleInterval / groundCount) * groundIdx + (Math.random() * 300 - 150))
      : PRE_DELAY;
    playOne(initialDelay);

    // cancel 핸들러 — drop 별 모든 timer + 리스너 정리
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      cleanupTimers.forEach(clearTimeout);
      cleanupTimers = [];
      initial.removeEventListener('animationend', onAnimEnd);
    };
  }

  /** ground drop 의 X 좌표 — 가운데 편향 + 활성 drop 회피 */
  function makeGroundXPicker(activeXs) {
    return function pickGroundX() {
      let best = null;
      let bestMinD = -Infinity;
      for (let i = 0; i < X_SAMPLE_TRIES; i++) {
        const x = (((Math.random() + Math.random() + Math.random()) / 3) * 100); // 가운데 편향(3개 uniform 평균)
        const minD = activeXs.length
          ? Math.min.apply(null, activeXs.map((v) => Math.abs(v - x)))
          : Infinity;
        if (minD >= MIN_X_DIST) return x;
        if (minD > bestMinD) { best = x; bestMinD = minD; }
      }
      return best != null ? best : 50;
    };
  }

  /** 새싹 + 오버레이 일러스트 단계 전환 스케줄 */
  function scheduleIllustStages(thanksModal) {
    const illust = thanksModal.querySelector('.modal-water-thanks__illust');
    const overlay = thanksModal.querySelector('.modal-water-thanks__illust-overlay');
    return ILLUST_STAGES.map((stage) => setTimeout(() => {
      if (illust) illust.src = stage.illustSrc;
      if (overlay) {
        overlay.src = stage.overlaySrc;
        if (stage.overlayShow) overlay.classList.add('modal-water-thanks__illust-overlay--visible');
      }
    }, stage.at));
  }

  /** 타이틀 typewriter 단계 — type-in / erase 페어 */
  function scheduleTitleStages(thanksModal) {
    const titleEl = thanksModal.querySelector('.modal-water-thanks__title');
    if (!titleEl) return [];
    const setTitle = (text) => {
      titleEl.textContent = text;
      titleEl.style.animation = 'none';
      void titleEl.offsetWidth;
      titleEl.style.animation = 'water-thanks-typewriter ' + TYPE_DUR + 'ms steps(' + text.length + ') forwards';
    };
    const eraseTitle = () => {
      const len = titleEl.textContent.length || 1;
      titleEl.style.animation = 'none';
      void titleEl.offsetWidth;
      titleEl.style.animation = 'water-thanks-eraser ' + TYPE_DUR + 'ms steps(' + len + ') forwards';
    };
    const timers = [];
    TITLE_STAGES.forEach(({ at, text }, i) => {
      timers.push(setTimeout(() => setTitle(text), at));
      // 마지막 단계는 erase 없이 stay
      if (i < TITLE_STAGES.length - 1) {
        timers.push(setTimeout(eraseTitle, TITLE_STAGES[i + 1].at - TYPE_DUR));
      }
    });
    return timers;
  }

  function cancel() {
    dropCycleCancels.forEach((c) => c());
    dropCycleCancels = [];
  }

  /** 시퀀스 시작 — thanks 모달이 active 가 되기 직전에 호출 */
  function start(thanksModal) {
    cancel();
    if (!thanksModal) return;
    const drops = thanksModal.querySelectorAll('.modal-water-thanks__drop');
    const grounds = Array.from(drops).filter((d) => d.classList.contains('modal-water-thanks__drop--ground'));
    const groundCount = grounds.length || 1;
    const startTime = performance.now() + PRE_DELAY;
    const activeXs = [];
    const pickGroundX = makeGroundXPicker(activeXs);

    // 일러스트 + 타이틀 + 자동 닫기
    const illustTimers = scheduleIllustStages(thanksModal);
    const titleTimers = scheduleTitleStages(thanksModal);
    const autoCloseTimer = setTimeout(() => {
      const closeBtn = thanksModal.querySelector('[data-modal-close]');
      if (closeBtn) closeBtn.click();
    }, AUTO_CLOSE_AT);
    dropCycleCancels.push(() => illustTimers.forEach(clearTimeout));
    dropCycleCancels.push(() => titleTimers.forEach(clearTimeout));
    dropCycleCancels.push(() => clearTimeout(autoCloseTimer));

    // 모든 drop 의 사이클 시작 — plant 1개 + ground N개
    drops.forEach((initial) => {
      const isGround = initial.classList.contains('modal-water-thanks__drop--ground');
      const groundIdx = isGround ? grounds.indexOf(initial) : -1;
      const cancelDrop = spawnDropCycle(initial, isGround, groundIdx, groundCount, startTime, activeXs, pickGroundX);
      dropCycleCancels.push(cancelDrop);
    });
  }

  /** 모달 reset (form 화면으로 복귀) — 시퀀스 cancel + 시각 요소 초기 상태 복귀 */
  function reset(backdrop) {
    cancel();
    if (!backdrop) return;
    const illust = backdrop.querySelector('.modal-water-thanks__illust');
    if (illust) illust.src = INITIAL_ILLUST;
    const overlay = backdrop.querySelector('.modal-water-thanks__illust-overlay');
    if (overlay) overlay.classList.remove('modal-water-thanks__illust-overlay--visible');
    const title = backdrop.querySelector('.modal-water-thanks__title');
    if (title) {
      title.textContent = INITIAL_TITLE;
      title.style.animation = 'none';
    }
    // 누적된 wet-spot 정리
    backdrop.querySelectorAll('.modal-water-thanks__wet-spot').forEach((el) => el.remove());
    // 모든 drop element 의 inline state 초기화 (다음 오픈 시 깨끗한 상태)
    backdrop.querySelectorAll('.modal-water-thanks__drop').forEach((d) => {
      d.classList.remove('modal-water-thanks__drop--landed');
      d.src = DROP_SRC;
      d.style.animation = 'none';
      d.style.left = '';
      d.style.removeProperty('--y-jitter');
    });
  }

  window.WaterThanks = { start, cancel, reset };
})();
