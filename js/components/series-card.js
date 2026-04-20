/* ============================================
   Series Card
     - 타이틀: MAX_TITLE_CHARS(30자) 초과 시 「…」 말줄임
     - 설명문: MAX_DESC_CHARS(80자) 초과 시 「…」 + 「もっと見る」 버튼 노출
     - 「もっと見る」 클릭 → 전체 텍스트 펼치고 버튼 라벨을 「折りたたむ」로 전환
     - 「折りたたむ」 클릭 → 다시 말줄임 상태로 복귀

   원본 텍스트는 data-full 속성에 보존.
   ============================================ */

(() => {
  const MAX_TITLE_CHARS = 30;
  const MAX_DESC_CHARS = 80;
  const LABEL_MORE = 'もっと見る';
  const LABEL_COLLAPSE = '折りたたむ';

  function checkTitle(title) {
    const full = title.dataset.full || title.textContent;
    if (!title.dataset.full) title.dataset.full = full;

    if (full.length > MAX_TITLE_CHARS) {
      title.textContent = full.slice(0, MAX_TITLE_CHARS) + '…';
    } else {
      title.textContent = full;
    }
  }

  function renderTruncated(desc) {
    const text = desc.querySelector('.series-card__desc-text');
    const moreBtn = desc.querySelector('.series-card__more');
    const full = text.dataset.full;

    text.textContent = '';
    text.append(full.slice(0, MAX_DESC_CHARS) + '…');
    text.append(moreBtn);
    moreBtn.textContent = LABEL_MORE;

    desc.classList.add('is-truncated');
    desc.classList.remove('is-expanded');
  }

  function renderExpanded(desc) {
    const text = desc.querySelector('.series-card__desc-text');
    const moreBtn = desc.querySelector('.series-card__more');
    const full = text.dataset.full;

    text.textContent = '';
    text.append(full);
    text.append(moreBtn);
    moreBtn.textContent = LABEL_COLLAPSE;

    desc.classList.remove('is-truncated');
    desc.classList.add('is-expanded');
  }

  function setupDesc(desc) {
    const text = desc.querySelector('.series-card__desc-text');
    const moreBtn = desc.querySelector('.series-card__more');
    if (!text || !moreBtn) return;

    const full = text.dataset.full || text.textContent;
    if (!text.dataset.full) text.dataset.full = full;

    if (full.length > MAX_DESC_CHARS) {
      renderTruncated(desc);
      moreBtn.addEventListener('click', () => {
        if (desc.classList.contains('is-expanded')) {
          renderTruncated(desc);
        } else {
          renderExpanded(desc);
        }
      });
    } else {
      text.textContent = full;
      desc.append(moreBtn);
      desc.classList.remove('is-truncated', 'is-expanded');
    }
  }

  function init() {
    document.querySelectorAll('.series-card__title').forEach(checkTitle);
    document.querySelectorAll('.series-card__desc').forEach(setupDesc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
