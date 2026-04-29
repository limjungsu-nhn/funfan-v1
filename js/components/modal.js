/* ============================================
   Modal Component JS

   트리거:
     - [data-modal-open="#modal-id"]   — 해당 modal 열기
     - [data-modal-close]              — 닫기 (유일한 닫기 경로, ESC·backdrop 클릭 없음)
     - [data-modal-next]               — step 2 로 전진 (track[data-step="2"])
     - [data-modal-back]               — 직전 step 으로 -1 (현재 step - 1, 최소 1)
     - [data-modal-goto="N"]           — 임의 step N 으로 이동

   동작:
     - 열림         : body scroll lock + 첫 열람 시 step 1 활성 + modal 컨테이너로 포커스
     - 닫힘         : backdrop 클래스 해제 → 퇴장 애니메이션(0.4s) 종료 후 내용 초기화
     - 탭 전환      : .tab-group .tab 클릭 → tab--selected + data-tab-target/[data-tab-panel] 매칭
     - step 2 자동 전진: step 1 에서 라디오 선택(or 이미 선택된 카드 재확정) → summary 반영 후 slide
     - Tab 이동     : 라벨(.radio-card) 자체가 tabbable (Space/Enter 로 선택·재확정)
     - 비활성 step  : inert 속성 → 포커스 진입 차단, viewport auto-scroll 방지
   ============================================ */
(function () {
  'use strict';

  function updateSubmitState(backdrop) {
    // step 1의 "次へ" 버튼 활성화 — 라디오 선택 여부에 연동
    const nextBtn = backdrop.querySelector('[data-modal-next]');
    if (nextBtn) {
      const hasChecked = !!backdrop.querySelector('input[type="radio"]:checked');
      nextBtn.disabled = !hasChecked;
    }
  }

  // 탭 전환 공통 로직 — click 핸들러 / resetModal 양쪽에서 재사용
  // backdrop 안의 모든 tab-group 을 동일 target 으로 동기화 → step 간 탭 상태 연계
  // (예: step 3 에서 "ストーリー" 로 바꾼 뒤 戻る → step 2 도 "ストーリー" 패널 표시)
  function selectTab(backdrop, tabEl) {
    const target = tabEl.getAttribute('data-tab-target');
    if (!target) return;
    backdrop.querySelectorAll('.tab-group').forEach((group) => {
      group.querySelectorAll('.tab').forEach((t) => {
        t.classList.toggle('tab--selected', t.getAttribute('data-tab-target') === target);
      });
    });
    backdrop.querySelectorAll('[data-tab-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-tab-panel') !== target;
    });
  }

  function goToStep(backdrop, step) {
    const track = backdrop.querySelector('.modal__track');
    if (!track) return;
    track.setAttribute('data-step', String(step));
    // 비활성 step 에는 inert 를 걸어 Tab 포커스가 숨겨진 step 으로 들어가
    // viewport 가 auto-scroll 로 밀리는 현상을 방지
    const steps = track.querySelectorAll(':scope > .modal__step');
    steps.forEach((el, i) => {
      if (i === step - 1) el.removeAttribute('inert');
      else el.setAttribute('inert', '');
    });
  }

  function openModal(id) {
    const backdrop = document.querySelector(id);
    if (!backdrop) return;
    backdrop.classList.add('modal-backdrop--open');
    document.body.style.overflow = 'hidden';
    // radio-card 는 리스트 항목 UI 이므로 Tab 키로 항목 간 이동이 가능하도록
    // label(.radio-card) 자체에 tabindex=0 부여.
    // input 은 width/height 0 + opacity 0 이라 브라우저가 포커스를 거부할 수 있음.
    backdrop.querySelectorAll('.radio-card').forEach((el) => {
      el.setAttribute('tabindex', '0');
    });
    goToStep(backdrop, 1);  // 열릴 때 step 1 활성화 + step 2 inert 처리
    updateSubmitState(backdrop);
    // 모달 컨테이너로 포커스 이동 — 첫 radio-card 가 focus 상태로 보여 다른 카드와 달라 보이는 현상 방지.
    // 모달 자체는 tabbable 하지 않으나 tabindex=-1 로 프로그래밍 포커스만 허용.
    const modal = backdrop.querySelector('.modal');
    if (modal) {
      if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
      modal.focus({ preventScroll: true });
    }
  }

  function resetModal(backdrop) {
    backdrop.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((el) => {
      el.checked = false;
    });
    backdrop.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="search"], input[type="tel"], input[type="url"], textarea').forEach((el) => {
      el.value = '';
    });
    backdrop.querySelectorAll('select').forEach((el) => {
      el.selectedIndex = 0;
    });
    // 탭 초기화 — 각 tab-group 의 첫 탭으로 selectTab() 재실행
    backdrop.querySelectorAll('.tab-group').forEach((group) => {
      const firstTab = group.querySelector('.tab');
      if (firstTab) selectTab(backdrop, firstTab);
    });
    goToStep(backdrop, 1);
    updateSubmitState(backdrop);
  }

  function closeModal(backdrop) {
    backdrop.classList.remove('modal-backdrop--open');
    if (!document.querySelector('.modal-backdrop--open')) {
      document.body.style.overflow = '';
    }
    // 퇴장 애니메이션(카드 0.4s / 배경 0.24s) 이후 초기화 — 사용자가 리셋 과정을 보지 않게
    const modal = backdrop.querySelector('.modal');
    const done = () => {
      // 다시 열려 있으면 리셋 건너뜀 (빠른 재오픈 레이스 대비)
      if (backdrop.classList.contains('modal-backdrop--open')) return;
      resetModal(backdrop);
    };
    if (modal) {
      let fired = false;
      const onEnd = (e) => {
        if (e.target !== modal || e.propertyName !== 'opacity') return;
        fired = true;
        modal.removeEventListener('transitionend', onEnd);
        done();
      };
      modal.addEventListener('transitionend', onEnd);
      // fallback — transitionend 가 불발 시
      setTimeout(() => { if (!fired) { modal.removeEventListener('transitionend', onEnd); done(); } }, 500);
    } else {
      setTimeout(done, 500);
    }
  }

  document.addEventListener('change', (e) => {
    const backdrop = e.target.closest('.modal-backdrop');
    if (!backdrop) return;
    updateSubmitState(backdrop);

    // 라디오 선택 → 선택 값을 step 2 summary 에 반영하고 자동 전환
    if (e.target.matches('input[type="radio"]')) {
      const card = e.target.closest('.radio-card');
      if (card) {
        const title = card.querySelector('.radio-card__title');
        const sub = card.querySelector('.radio-card__sub');
        const sumTitle = backdrop.querySelector('.modal__summary-card__title');
        const sumSub = backdrop.querySelector('.modal__summary-card__sub');
        if (sumTitle && title) sumTitle.textContent = title.textContent;
        if (sumSub && sub) sumSub.textContent = sub.textContent;
      }
      goToStep(backdrop, 2);
    }
  });

  // 포커스된 radio-card 에서 Space/Enter 로 선택 — 이미 선택된 카드라도 step 2 로 전진
  document.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    const card = e.target.closest?.('.modal-backdrop .radio-card');
    if (!card) return;
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    e.preventDefault();
    if (!input.checked) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // 이미 선택된 카드 재확정 — change 이벤트가 안 뜨므로 수동으로 step 2 전환
      const backdrop = card.closest('.modal-backdrop');
      if (backdrop) goToStep(backdrop, 2);
    }
  });

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute('data-modal-open'));
      return;
    }

    // 이미 선택된 radio-card 를 다시 클릭 — change 이벤트가 안 뜨므로 수동으로 step 2 전환
    const reCard = e.target.closest('.modal-backdrop .radio-card');
    if (reCard) {
      const input = reCard.querySelector('input[type="radio"]');
      if (input && input.checked) {
        const backdrop = reCard.closest('.modal-backdrop');
        if (backdrop) goToStep(backdrop, 2);
        return;
      }
      // 미선택 카드는 native label 동작에 맡김 → change 이벤트 경로로 처리
    }

    const nextBtn = e.target.closest('[data-modal-next]');
    if (nextBtn && !nextBtn.disabled) {
      const backdrop = nextBtn.closest('.modal-backdrop');
      if (backdrop) goToStep(backdrop, 2);
      return;
    }

    const backBtn = e.target.closest('[data-modal-back]');
    if (backBtn) {
      const backdrop = backBtn.closest('.modal-backdrop');
      if (backdrop) {
        const track = backdrop.querySelector('.modal__track');
        const cur = parseInt(track?.getAttribute('data-step') || '1', 10);
        goToStep(backdrop, Math.max(1, cur - 1));
      }
      return;
    }

    const gotoBtn = e.target.closest('[data-modal-goto]');
    if (gotoBtn) {
      const backdrop = gotoBtn.closest('.modal-backdrop');
      const target = parseInt(gotoBtn.getAttribute('data-modal-goto'), 10);
      if (backdrop && Number.isFinite(target)) {
        goToStep(backdrop, target);
        // data-tab-target 동반 시 해당 패널로 자동 전환 (탭 UI 가 없어도 panel hidden 토글)
        const tabTarget = gotoBtn.getAttribute('data-tab-target');
        if (tabTarget) {
          const tab = backdrop.querySelector('.tab[data-tab-target="' + tabTarget + '"]');
          if (tab) {
            selectTab(backdrop, tab);
          } else {
            backdrop.querySelectorAll('[data-tab-panel]').forEach((panel) => {
              panel.hidden = panel.getAttribute('data-tab-panel') !== tabTarget;
            });
          }
        }
      }
      return;
    }

    // 모달 내부 탭 전환
    const tabEl = e.target.closest('.modal-backdrop .tab-group .tab');
    if (tabEl) {
      selectTab(tabEl.closest('.modal-backdrop'), tabEl);
      return;
    }

    const closer = e.target.closest('[data-modal-close]');
    if (closer) {
      const backdrop = closer.closest('.modal-backdrop');
      if (backdrop) closeModal(backdrop);
    }
  });
})();
