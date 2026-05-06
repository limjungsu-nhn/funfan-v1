/* ============================================
   garden — 화단(.garden) 식물 물주기 + bloom 시퀀스

   진입점:
     - 화단 우측 「水をあげて応援する」 버튼 → #modal-water-support 모달
     - 모달 form → thanks step 시퀀스 → auto-close (9.5s) 가 1회 물주기
     - 식물 자체는 클릭 불가 (시각적 표시만)

   동작:
     1. 페이지 로드 시 reorder() — after / before / empty 순으로 자동 정렬
        + 첫 --before 에 --active 부여 (다음 차례 표시)
        + pinSwayTimings() 로 각 식물 sway duration/delay 인라인 고정
     2. 모달이 닫힐 때마다 active 식물 카운터 +1 (per-element WeakMap)
     3. WATER_THRESHOLD(=5) 도달 시 close 트랜지션 종료 후 bloom() 진입
        — body 직속 .garden__halo 글로우 페이드인 (3겹 원형, 컨테이너 클립 우회)
        — 프레임 시퀀스 재생 (img/flower/flower_XX/flower_XX_{1..N}.png)
        — sway 는 그대로 유지 → swap 시 흔들림 위상 끊김 없음
     4. 마지막 프레임 후 halo 퇴장 애니메이션 0.5s 대기 →
        src 를 img/img_flower_XX_after.png 로 swap + 클래스 정리 + reorder()
        (reorder 는 Animation.startTime 보존으로 sway 재시작 방지)

   재정렬 규칙: after 4 슬롯 → before 6 슬롯 → empty 2 슬롯 (총 12, 6/row × 2 rows).
                garden-sign 은 첫 row 의 첫 자식으로 보존.
   ============================================ */
(function () {
  'use strict';

  const WATER_THRESHOLD = 5;
  const FRAME_RATE = 30;                     // fps
  const FRAME_DURATION = 1000 / FRAME_RATE;  // ≈ 33.33ms
  const PER_ROW = 6;
  /* 각 flower id 의 시퀀스 프레임 수 — img/flower/flower_XX/ 안의 파일 개수와 일치 */
  const FRAME_COUNTS = { '01': 122, '02': 122, '03': 122, '04': 96 };

  /* modal close 트랜지션(~0.4s) 종료 후 bloom 시작까지 대기 — 모달 잔상 사라진 뒤 시퀀스 시작 */
  const MODAL_CLOSE_TRANSITION_MS = 500;

  const counters = new WeakMap(); // element → 누적 물주기 수

  function reorder(garden) {
    const rows = Array.from(garden.querySelectorAll('.garden__row'));
    if (!rows.length) return;
    const allItems = rows.flatMap((r) => Array.from(r.querySelectorAll('.garden__item')));

    /* sway 애니메이션의 startTime 을 reorder 전에 캡처 —
       replaceChildren 이 노드를 detach/attach 하면서 CSS animation 이 재시작되는데,
       reorder 후 새로 생성된 Animation 의 startTime 을 원래 값으로 되돌려 위상 보존. */
    const startTimes = new Map();
    allItems.forEach((el) => {
      const anims = el.getAnimations ? el.getAnimations() : [];
      const sway = anims.find((a) => a.animationName === 'garden-sway');
      if (sway && sway.startTime != null) startTimes.set(el, sway.startTime);
    });

    const afters  = allItems.filter((el) => el.classList.contains('garden__item--after'));
    const befores = allItems.filter((el) => el.classList.contains('garden__item--before'));
    const empties = allItems.filter((el) => el.classList.contains('garden__item--empty'));
    const sorted = [...afters, ...befores, ...empties];

    const sign = rows[0].querySelector('.garden-sign');
    const row1Items = sorted.slice(0, PER_ROW);
    const row2Items = sorted.slice(PER_ROW, PER_ROW * 2);

    if (sign) rows[0].replaceChildren(sign, ...row1Items);
    else rows[0].replaceChildren(...row1Items);
    if (rows[1]) rows[1].replaceChildren(...row2Items);

    /* 위상 복원 — reorder 후 재생성된 sway Animation 의 startTime 을 원래 값으로 */
    startTimes.forEach((startTime, el) => {
      const anims = el.getAnimations ? el.getAnimations() : [];
      const sway = anims.find((a) => a.animationName === 'garden-sway');
      if (sway) {
        try { sway.startTime = startTime; } catch (e) { /* readonly in some browsers */ }
      }
    });

    /* 순차 진입 — 첫 번째 --before 에만 --active 부여 (다음 물주기 대상 표시) */
    befores.forEach((el, idx) => {
      el.classList.toggle('garden__item--active', idx === 0);
    });
  }

  function getActiveItem(garden) {
    return garden.querySelector('.garden__item--before.garden__item--active');
  }

  function preloadFrames(id, total) {
    /* 첫 트리거 시 한 번만 호출 — 브라우저 이미지 캐시에 미리 적재 */
    for (let i = 1; i <= total; i++) {
      const img = new Image();
      img.src = `img/flower/flower_${id}/flower_${id}_${i}.png`;
    }
  }

  function playSequence(item, garden) {
    const id = item.dataset.flowerId;
    const total = FRAME_COUNTS[id];
    if (!id || !total) return finish(item, garden);

    /* requestAnimationFrame 으로 시간 기반 프레임 인덱싱 (드롭 방지) */
    let startTime = null;
    const step = (now) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const frame = Math.min(total - 1, Math.floor(elapsed / FRAME_DURATION));
      item.src = `img/flower/flower_${id}/flower_${id}_${frame + 1}.png`;
      if (frame < total - 1) {
        requestAnimationFrame(step);
      } else {
        /* 마지막 프레임을 잠깐 hold 후 _after.png 로 transition */
        setTimeout(() => finish(item, garden), 120);
      }
    };
    requestAnimationFrame(step);
  }

  /* 마지막 프레임까지 재생된 후 호출 —
     halo 퇴장 애니메이션 완료를 기다린 뒤 _after.png 로 swap + 클래스 정리 + reorder.
     swap 이 너무 빨리 일어나면 halo 가 사라지면서 꽃 모양이 갑자기 변해버리는 어색함이 생겨,
     halo 가 완전히 사라진 시점에 한꺼번에 전환되도록 순서를 맞춤. */
  function finish(item, garden) {
    removeHalo(item, () => {
      const id = item.dataset.flowerId;
      if (id) item.src = `img/img_flower_${id}_after.png`;
      item.classList.remove('garden__item--before', 'garden__item--active', 'garden__item--blooming');
      item.classList.add('garden__item--after');
      item.dataset.state = 'after';
      counters.delete(item);
      reorder(garden);
    });
  }

  /* halo 는 document.body 에 직접 삽입 — .garden 의 overflow:hidden 클립을 우회.
     compact 변형(.garden--compact) 안의 꽃이면 스케일 0.7, 그 외는 1. */
  function addHalo(item) {
    const halo = document.createElement('div');
    halo.className = 'garden__halo';
    halo.innerHTML =
      '<div class="garden__halo-ring garden__halo-ring--outer"></div>' +
      '<div class="garden__halo-ring garden__halo-ring--mid"></div>' +
      '<div class="garden__halo-ring garden__halo-ring--inner"></div>';

    const rect = item.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + window.scrollX;
    const cy = rect.top  + rect.height / 2 + window.scrollY;
    halo.style.left = cx + 'px';
    /* 시각 보정 — halo 중심을 item 중심에서 4px 아래로 */
    halo.style.top  = (cy + 4) + 'px';

    if (item.closest('.garden--compact')) {
      halo.style.setProperty('--halo-scale', '0.7');
    }

    document.body.appendChild(halo);
    return halo;
  }

  /* 퇴장 애니메이션(0.5s) 후 DOM 제거 + onDone 콜백 — 안전망 setTimeout 동반.
     halo 가 없으면 onDone 즉시 호출. */
  function removeHalo(item, onDone) {
    const halo = item._halo;
    if (!halo) {
      if (onDone) onDone();
      return;
    }
    item._halo = null;
    halo.classList.add('garden__halo--leaving');
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      halo.remove();
      if (onDone) onDone();
    };
    halo.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 700);
  }

  function bloom(item, garden) {
    if (!item || item.classList.contains('garden__item--blooming')) return;
    const id = item.dataset.flowerId;
    if (!id) return;
    item.classList.add('garden__item--blooming');
    item.classList.remove('garden__item--active');
    preloadFrames(id, FRAME_COUNTS[id] || 0);
    item._halo = addHalo(item);
    requestAnimationFrame(() => playSequence(item, garden));
  }

  /* 모달 close 감지 — backdrop 'modal-backdrop--open' 클래스 제거를 1회 물주기로 카운트 */
  function watchWaterSupportModal(garden) {
    const backdrop = document.getElementById('modal-water-support');
    if (!backdrop) return;

    let wasOpen = backdrop.classList.contains('modal-backdrop--open');
    let pendingActive = null; // 모달 열릴 시점의 active 식물 (열리는 동안 bloom 으로 사라져도 안전)

    const observer = new MutationObserver(() => {
      const isOpen = backdrop.classList.contains('modal-backdrop--open');

      if (!wasOpen && isOpen) {
        /* 모달 오픈 — 이 시점의 active 식물을 캡처 */
        pendingActive = getActiveItem(garden);
      } else if (wasOpen && !isOpen) {
        /* 모달 닫힘 — 카운터 +1, 임계치 도달 시 bloom */
        const target = pendingActive || getActiveItem(garden);
        pendingActive = null;
        if (target && !target.classList.contains('garden__item--blooming')) {
          const count = (counters.get(target) || 0) + 1;
          counters.set(target, count);
          if (count >= WATER_THRESHOLD) {
            /* close 트랜지션이 끝난 뒤 시퀀스 시작 — 모달 잔상이 사라진 뒤 */
            setTimeout(() => bloom(target, garden), MODAL_CLOSE_TRANSITION_MS);
          }
        }
      }
      wasOpen = isOpen;
    });
    observer.observe(backdrop, { attributes: true, attributeFilter: ['class'] });
  }

  /* 각 식물의 sway 타이밍을 인라인으로 고정.
     CSS 의 :nth-child(2n/3n/5n) 변형은 DOM 인덱스에 따라 duration/delay 가 다른데,
     reorder() 로 위치가 바뀔 때마다 nth 매칭이 변하면 sway 가 재시작되어 리듬이 튐.
     init 시점의 계산값을 인라인으로 박아두면 어떤 위치로 옮겨도 동일 리듬 유지 →
     bloom 끝에서 _after.png 로 swap 되는 순간도 sway 가 끊김 없이 이어짐. */
  function pinSwayTimings(garden) {
    garden.querySelectorAll('.garden__item:not(.garden__item--empty)').forEach((el) => {
      const cs = getComputedStyle(el);
      el.style.animationDuration = cs.animationDuration;
      el.style.animationDelay = cs.animationDelay;
    });
  }

  function init() {
    const garden = document.querySelector('.garden');
    if (!garden) return;

    /* 페이지 로드 시 정렬 (HTML 순서 잘못 들어와도 보정) */
    reorder(garden);
    pinSwayTimings(garden);

    /* 테스트 편의: before 항목들 카운터를 (THRESHOLD - 1) 로 미리 채워둠 →
       1회 물주기만으로 즉시 bloom 트리거 가능 */
    garden.querySelectorAll('.garden__item--before').forEach((el) => {
      counters.set(el, WATER_THRESHOLD - 1);
    });

    watchWaterSupportModal(garden);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
