/* ============================================
   Episode Card — 정렬 토글
     - .episode-header__sort 클릭 시 라벨 토글 (古い順 ↔ 新しい順)
     - .episode-card__list 자식 <li> 순서를 역순으로 재배치
     - .episode-card 내부에 있는 경우만 동작 (standalone 헤더는 영향 없음)
   ============================================ */

(() => {
  const LABEL_OLD_FIRST = '古い順';
  const LABEL_NEW_FIRST = '新しい順';

  function toggleSort(card) {
    const list = card.querySelector('.episode-card__list');
    const label = card.querySelector('.episode-header__sort-label');
    if (!list || !label) return;

    const items = Array.from(list.children);
    items.reverse().forEach((li) => list.appendChild(li));

    const current = label.textContent.trim();
    label.textContent = current === LABEL_OLD_FIRST ? LABEL_NEW_FIRST : LABEL_OLD_FIRST;
  }

  function init() {
    document.querySelectorAll('.episode-card').forEach((card) => {
      const sortBtn = card.querySelector('.episode-header__sort');
      if (!sortBtn) return;
      sortBtn.addEventListener('click', () => toggleSort(card));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
