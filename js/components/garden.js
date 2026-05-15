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
        + 모달 오픈 시 해당 식물의 시퀀스 프레임 백그라운드 프리로드 시작
     3. 물주기 정책 (두 가지 카운터 병행):
        (a) per-flower bloom 카운터 (WeakMap counters): 해당 꽃의 누적 5회째에 개화
        (b) 글로벌 sign 카운터 (globalWaterCount): garden 전체 누적 1·2·3회째에만 sign 애니메이션 발동
            — 4회째 이후로는 sign 애니메이션 없음 (라인 3개가 다 채워지면 그대로 유지)
        예) 1·2·3회 → sign 애니메이션 + 1·2·3 라인 타이핑
            4회      → 동작 없음
            5회      → 1번 꽃 bloom
            6·7·8·9회 → 동작 없음 (sign 라인은 이미 채워져 변화 없음)
            10회     → 2번 꽃 bloom (계속 5의 배수마다)
     4. bloom: close 트랜지션 후 진입 → Lottie halo + Lottie 시퀀스 (flower_XX.js, 4s @ 100fps, 192×216)
        마지막 프레임 후 halo 퇴장 → _after.png swap + 클래스 정리 + reorder().
        sign 라인은 bloom 종료 시 리셋하지 않음 (글로벌 정책)

   재정렬 규칙: after 4 슬롯 → before 6 슬롯 → empty 2 슬롯 (총 12, 6/row × 2 rows).
                garden-sign 은 첫 row 의 첫 자식으로 보존.
   ============================================ */
(function () {
  'use strict';

  const WATER_THRESHOLD = 5;
  const PER_ROW = 6;
  /* 지원되는 flower id 목록 — bloom 시 Lottie 데이터를 동적 로드할 키 (`img/animations/flower_XX.js`).
     v1.07.4+: 이미지 시퀀스(WebP 122프레임) → Lottie JSON 으로 교체. 값은 valid id 표시용. */
  const FLOWER_IDS = { '01': true, '02': true, '03': true, '04': true };

  /* modal close 트랜지션(~0.4s) 종료 후 bloom 시작까지 대기 — 모달 잔상 사라진 뒤 시퀀스 시작 */
  const MODAL_CLOSE_TRANSITION_MS = 500;

  const counters = new WeakMap(); // element → 누적 물주기 수 (per-flower bloom 카운터)
  let globalWaterCount = 0;       // garden 전체 누적 물주기 수 (sign 트리거 — 최초 3회만 발동)

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

  /* bloom 진행 중에는 어떤 꽃도 --active 가 없음 (bloom 이 --active 를 제거하고, 다음 꽃의 --active 는
     bloom 완료 후 reorder() 에서야 부여됨). 그 사이에 다음 물주기 close 가 일어나면 getActiveItem 이
     null 이 되어 카운트가 증발 → 다음 bloom 까지 11회 필요해지는 off-by-one 발생.
     대안: --blooming 이 아닌 첫 --before 꽃을 fallback 으로 사용. 이 꽃은 곧 --active 가 될 다음 차례.
     이로써 bloom 중 들어온 물주기도 다음 꽃의 카운터로 자연 이월됨. */
  function getNextWaterableItem(garden) {
    return garden.querySelector('.garden__item--before:not(.garden__item--blooming)');
  }

  /* 프레임 프리로드 — 모달 오픈 시점에 1회 호출 (id 별 idempotent).
     v1.07.4+: 이미지 시퀀스 → Lottie JSON 대체. 해당 flower id 의 JS wrapper 를 동적 <script> 로 로드.
     모달 시퀀스 동안 백그라운드 다운로드 → bloom 시작 시 window.FLOWER_LOTTIE_DATA[id] 즉시 사용. */
  const preloadedIds = new Set();
  function preloadFrames(id /*, total — Lottie 사용으로 미사용 */) {
    if (preloadedIds.has(id)) return;
    preloadedIds.add(id);
    if (window.FLOWER_LOTTIE_DATA && window.FLOWER_LOTTIE_DATA[id]) return; // already loaded
    const script = document.createElement('script');
    script.src = `img/animations/flower_${id}.js`;
    script.async = true;
    document.head.appendChild(script);
  }

  /* item 의 "회전 전(at-rest)" 페이지 좌표 + 크기 계산.
     getBoundingClientRect() 는 sway 회전(±1.8°) 후의 AABB 라서 96×108 박스가 약 99×111 로
     커져 overlay 와 underlying item 의 사이즈/위치가 미세하게 어긋난다.
     offsetParent 체인 + offsetWidth/Height 는 transform 영향을 받지 않으므로 정확한 at-rest 값. */
  function getItemAtRestPageRect(item) {
    let left = 0, top = 0;
    let node = item;
    while (node) {
      left += node.offsetLeft;
      top  += node.offsetTop;
      node = node.offsetParent;
    }
    return { left, top, width: item.offsetWidth, height: item.offsetHeight };
  }

  /* Lottie 기반 bloom 시퀀스 — item 위에 절대 위치 overlay 컨테이너 생성 + Lottie 재생.
     자연 종료(`complete` 이벤트) 시점에 finish() 호출 → halo 퇴장 → _after.png swap. */
  function playSequence(item, garden) {
    const id = item.dataset.flowerId;
    const data = window.FLOWER_LOTTIE_DATA && window.FLOWER_LOTTIE_DATA[id];
    if (!id || !data || typeof window.lottie === 'undefined') {
      // Lottie 미준비 시 즉시 finish (graceful fallback)
      return finish(item, garden);
    }

    /* 1) overlay div 를 body 직속으로 생성 — item 의 "회전 전" 화면 위치/사이즈와 동일.
       sway 회전 후의 bbox 가 아닌 at-rest 좌표를 사용 → underlying item 과 정확히 겹침. */
    const overlay = document.createElement('div');
    overlay.className = 'garden__bloom-lottie';
    const rect = getItemAtRestPageRect(item);
    overlay.style.left   = rect.left + 'px';
    overlay.style.top    = rect.top  + 'px';
    overlay.style.width  = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    /* 밑단 item 과 sway 위상 동기화 — duration/delay 를 인라인으로 복사하고,
       overlay 가 DOM 에 붙어 Animation 이 생성된 직후 startTime 을 item 의 것과
       일치시킨다. 시퀀스 종료 후 item 이 다시 보이는 순간 흔들림이 끊김 없이 이어짐. */
    const itemStyle = item.style;
    if (itemStyle.animationDuration) overlay.style.animationDuration = itemStyle.animationDuration;
    if (itemStyle.animationDelay)    overlay.style.animationDelay    = itemStyle.animationDelay;
    document.body.appendChild(overlay);
    try {
      const itemAnims = item.getAnimations ? item.getAnimations() : [];
      const itemSway = itemAnims.find((a) => a.animationName === 'garden-sway');
      const overlayAnims = overlay.getAnimations ? overlay.getAnimations() : [];
      const overlaySway = overlayAnims.find((a) => a.animationName === 'garden-sway');
      if (itemSway && overlaySway && itemSway.startTime != null) {
        overlaySway.startTime = itemSway.startTime;
      }
    } catch (e) { /* startTime is readonly in some browsers — graceful skip */ }
    item._bloomOverlay = overlay;

    /* 2) Lottie 인스턴스 생성 + autoplay.
       rendererSettings: hideOnTransparent=true (투명 레이어 페인트 skip)
                         progressiveLoad=false (시작 전 전체 frame 사전 마운트 → 첫 프레임 jank 방지) */
    const anim = window.lottie.loadAnimation({
      container: overlay,
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
    item._bloomLottie = anim;

    /* 3) 자연 종료 → 짧은 hold 후 finish */
    anim.addEventListener('complete', () => {
      setTimeout(() => finish(item, garden), 120);
    });
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
      /* Lottie overlay 정리 */
      if (item._bloomLottie) {
        try { item._bloomLottie.destroy(); } catch (e) { /* noop */ }
        item._bloomLottie = null;
      }
      if (item._bloomOverlay) {
        item._bloomOverlay.remove();
        item._bloomOverlay = null;
      }
      reorder(garden);
      /* sign 라인은 글로벌 정책 — 최초 3회 물주기로 한번 채워지면 garden 전체 사이클 동안 유지.
         bloom 종료 시 리셋하지 않음 (개화될 때마다 라인이 초기화되면 사용자의 닉네임이 사라짐). */
    });
  }

  /* halo 는 document.body 에 직접 삽입 — .garden 의 overflow:hidden 클립을 우회.
     v1.07.4+: 3겹 CSS 원형 → Lottie 애니메이션(`light.js`, 4s @ 100fps, 400×400)으로 교체.
     compact 변형(.garden--compact) 안의 꽃이면 스케일 0.7, 그 외는 1. */
  function addHalo(item) {
    const halo = document.createElement('div');
    halo.className = 'garden__halo';

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

    /* Lottie 인스턴스 생성 — 4s 자체 시퀀스 (등장/유지/퇴장 모두 포함).
       rendererSettings 로 투명 레이어 skip + 전체 frame 사전 마운트로 jank 최소화. */
    const data = window.LIGHT_LOTTIE_DATA;
    if (data && typeof window.lottie !== 'undefined') {
      const anim = window.lottie.loadAnimation({
        container: halo,
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
      item._haloLottie = anim;
    }
    return halo;
  }

  /* 타이핑 효과 — 한 글자씩 textContent 에 누적. data-typed-text 가 원본 텍스트,
     화면 표시는 빈 상태에서 시작해서 한 글자씩 채워짐.
     트리거 1회 = 한 줄만 타이핑 (halo 4s 안에서 충분히 끝나도록 라인당 1.5s). */
  const TYPE_LINE_MS = 1500;
  function typeName(el) {
    const text = el.getAttribute('data-typed-text') || '';
    const chars = Array.from(text); // 서로게이트 페어/이모지 안전 분리
    if (!chars.length) return;
    if (el._typeTimer) {
      clearTimeout(el._typeTimer);
      el._typeTimer = null;
    }
    const step = TYPE_LINE_MS / chars.length;
    el.textContent = '';
    let i = 0;
    const tick = () => {
      i += 1;
      el.textContent = chars.slice(0, i).join('');
      if (i < chars.length) {
        el._typeTimer = setTimeout(tick, step);
      } else {
        el._typeTimer = null;
      }
    };
    el._typeTimer = setTimeout(tick, step);
  }

  /* 한 송이 꽃의 물주기 사이클 동안 1·2·3회째 모달 close 시 sign 애니메이션 발동:
     해당 라인(0/1/2)에 더미 닉네임을 타이핑 + light Lottie halo 1회 재생.
     호출자(watchWaterSupportModal)가 lineIdx 를 정수(0~2)로 전달.
     halo Lottie 가 4s 라서 빠른 물주기 연타 시 호출이 겹칠 수 있음 → 이전 halo 가 살아있으면
     destroy 후 새로 시작 (fresh restart). 타이핑은 항상 진행 (스킵하면 라인이 비어버림). */
  function fireSignAnimation(garden, lineIdx) {
    const sign = garden.querySelector('.garden-sign');
    if (!sign) return;
    const typedEls = Array.from(sign.querySelectorAll('.garden-sign__name[data-typed-text]'));
    if (lineIdx < 0 || lineIdx >= typedEls.length) return;

    /* 이전 halo 정리 (있다면) — overlap fresh restart */
    if (sign._halo) {
      if (sign._haloLottie) {
        try { sign._haloLottie.destroy(); } catch (e) { /* noop */ }
        sign._haloLottie = null;
      }
      sign._halo.remove();
      sign._halo = null;
    }

    sign._halo = addHalo(sign);
    typeName(typedEls[lineIdx]);

    const anim = sign._haloLottie;
    if (anim) {
      anim.addEventListener('complete', () => {
        removeHalo(sign, null);
      });
    } else {
      removeHalo(sign, null);
    }
  }

  /* Lottie 가 자체 퇴장을 포함하므로 (4s 안에 등장+유지+퇴장 완료) 호출 시점에 즉시 정리.
     halo 가 없으면 onDone 즉시 호출. */
  function removeHalo(item, onDone) {
    const halo = item._halo;
    if (!halo) {
      if (onDone) onDone();
      return;
    }
    item._halo = null;
    if (item._haloLottie) {
      try { item._haloLottie.destroy(); } catch (e) { /* noop */ }
      item._haloLottie = null;
    }
    halo.remove();
    if (onDone) onDone();
  }

  function bloom(item, garden) {
    if (!item || item.classList.contains('garden__item--blooming')) return;
    const id = item.dataset.flowerId;
    if (!id) return;
    item.classList.add('garden__item--blooming');
    item.classList.remove('garden__item--active');
    /* 프리로드는 모달 오픈 시점에 이미 시작됨 — 안전망으로 한번 더 호출 (idempotent) */
    preloadFrames(id);
    item._halo = addHalo(item);
    requestAnimationFrame(() => playSequence(item, garden));
  }

  /* 모달 close 감지 — backdrop 'modal-backdrop--open' 클래스 제거를 1회 물주기로 카운트.
     target 은 close 시점의 --active 꽃으로 fresh 하게 재해결 (bloom 중간에 active 가 다음 꽃으로
     넘어가는 race 안전). 진행 중 bloom 꽃에는 카운트하지 않음 (--active 가 사라져 있으므로 자연스럽게 제외). */
  function watchWaterSupportModal(garden) {
    const backdrop = document.getElementById('modal-water-support');
    if (!backdrop) return;

    let wasOpen = backdrop.classList.contains('modal-backdrop--open');

    const observer = new MutationObserver(() => {
      const isOpen = backdrop.classList.contains('modal-backdrop--open');

      if (!wasOpen && isOpen) {
        /* 모달 오픈 — 현재 --active 식물의 flower id 프리로드 (WaterThanks Lottie 동안 백그라운드) */
        const active = getActiveItem(garden);
        if (active) {
          const id = active.dataset.flowerId;
          if (id && FLOWER_IDS[id]) preloadFrames(id);
        }
      } else if (wasOpen && !isOpen) {
        /* 모달 닫힘 — 단, 실제 물주기 완료(폼 제출 → thanks 단계 진입 → 자동 close)인 경우에만 카운트.
           사용자가 form 단계에서 X / 閉じる 로 취소한 경우 thanks 가 활성화된 적이 없으므로 카운트하지 않음.
           판별: close 시점에 thanks step 이 활성(modal--inactive 클래스 없음)인지 확인.

           target 재해결: close 시점에 getActiveItem 우선, bloom 진행 중이면 getNextWaterableItem fallback.
             - 정상 흐름: --active 꽃이 그대로 target
             - bloom race: bloom 중에는 어떤 꽃도 --active 가 없으므로 getNextWaterableItem 으로
               다음 --before(non-blooming) 꽃에 카운트를 누적 → off-by-one 없이 정상 사이클 유지

           정책:
             count 1·2·3 → sign 애니메이션 + 해당 라인(0/1/2) 더미 닉네임 타이핑
             count 4     → 시각 효과 없음 (조용히 누적)
             count 5     → bloom (개화 시퀀스) */
        const thanksStep = backdrop.querySelector('[data-step="thanks"]');
        const submitted = !!(thanksStep && !thanksStep.classList.contains('modal--inactive'));
        /* target: --active 우선, bloom 중이면 fallback 으로 다음 --before(non-blooming) 꽃 사용 */
        const target = getActiveItem(garden) || getNextWaterableItem(garden);
        if (submitted && target) {
          /* per-flower bloom 카운터 (해당 꽃의 5회 누적 → 개화) */
          const count = (counters.get(target) || 0) + 1;
          counters.set(target, count);
          /* 글로벌 sign 카운터 (garden 전체 최초 3회만 sign 애니메이션 발동) */
          globalWaterCount += 1;
          if (globalWaterCount >= 1 && globalWaterCount <= 3) {
            const lineIdx = globalWaterCount - 1;
            setTimeout(() => fireSignAnimation(garden, lineIdx), MODAL_CLOSE_TRANSITION_MS);
          }
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

    /* 정책상 1번 꽃 사이클 = 5회 물주기 → 카운터 0 부터 자연 누적. pre-fill 없음. */
    watchWaterSupportModal(garden);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
