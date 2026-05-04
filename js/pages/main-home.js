/* ============================================
   Main Home — Infinite Scroll (random content)

   하단 sentinel 가시화 시 랜덤 카드 12장씩 추가.
   이미지 풀: img_comic_01 ~ img_comic_20
   타이틀·작가 풀: TITLES / AUTHORS 배열
   카운트: 1~99 랜덤
   ============================================ */
(function () {
  /* 새로고침 시 스크롤 복원 차단 — 무한스크롤로 생성한 콘텐츠는 휘발이라
     이전 위치를 복원하면 빈 공간으로 떨어짐 */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const masonry = document.querySelector('.main-home__masonry');
  const sentinel = document.querySelector('.main-home__sentinel');
  if (!masonry || !sentinel) return;

  const columns = Array.from(masonry.querySelectorAll('.main-home__column'));
  if (!columns.length) return;

  /* 데모 카드 — href="#" 클릭 시 최상단 점프 방지 (실제 라우팅 미연결 단계) */
  masonry.addEventListener('click', (e) => {
    const card = e.target.closest('.post-card');
    if (card && card.getAttribute('href') === '#') e.preventDefault();
  });

  /* 가장 짧은 컬럼 찾기 — 누적 height(JS 추적) 기반.
     getBoundingClientRect는 이미지 미로드 시점에 부정확하므로 attr-based 누적 사용. */
  const colHeights = columns.map((c) => c.getBoundingClientRect().height);
  const shortestIdx = () => colHeights.indexOf(Math.min(...colHeights));

  const TOTAL_IMAGES = 20;
  const BATCH = 12;

  /* 이미지 실측 height (가로는 모두 644 고정) — masonry reflow 방지용 */
  const IMG_H = {
    1: 482, 2: 644, 3: 618, 4: 644, 5: 382,
    6: 382, 7: 382, 8: 390, 9: 644, 10: 376,
    11: 382, 12: 472, 13: 382, 14: 382, 15: 382,
    16: 382, 17: 382, 18: 382, 19: 382, 20: 382,
  };

  const TITLES = [
    '彼氏お断り！', '星屑のレシピ', '深海図書館', 'サクラ通信',
    '硝子の街角', '風と猫の駅', '真夜中ラジオ', '夜明けのキッチン',
    '月の手紙', '私の冒険', '青い雨の日', '花咲く屋上',
    '星間カフェ', '夕焼けジャム', '雪の日記', '海辺のメロディ',
    '替代動物', '冷たさを残した矢', 'キャットマン', '炭鉱のカナリア',
    'メイドのハル', 'ついていけないよ', '化物学校', '千支娘2026物語',
  ];

  const AUTHORS = [
    '富所風雅１番目', '桜井あかね', '海野こずえ', '川辺ふうか',
    '月村あいり', '高橋りお', '霧島ナナ', '朝倉さくら',
    '小川みち', '山本ハル', '水木れい', '西野はる',
    '藤本そら', '岡田ことり', '白石みお', '木下なぎさ',
  ];

  const pad2 = (n) => String(n).padStart(2, '0');
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];

  /* 이미지 비복원 추출 — 셔플된 풀을 순차 소비, 비면 재셔플(최근 N개 회피) */
  const RECENT_AVOID = 8; /* 한 뷰포트(약 4~8장)에서 중복 회피 */
  let imgPool = [];
  let imgRecent = [];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function refillPool() {
    let next;
    do {
      next = shuffle(Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1));
    } while (imgRecent.length && imgRecent.includes(next[0]));
    imgPool = next;
  }
  function nextImage() {
    if (!imgPool.length) refillPool();
    const idx = imgPool.shift();
    imgRecent.push(idx);
    if (imgRecent.length > RECENT_AVOID) imgRecent.shift();
    return idx;
  }

  function makeCard() {
    const idx = nextImage();
    const title = pick(TITLES);
    const author = pick(AUTHORS);
    const count = rand(99) + 1;

    const a = document.createElement('a');
    a.className = 'post-card';
    a.href = '#';
    a.innerHTML = `
      <span class="post-card__image-wrap"><img class="post-card__image" src="img/img_comic_${pad2(idx)}.png" alt="" width="644" height="${IMG_H[idx]}"></span>
      <div class="post-card__meta">
        <div class="post-card__head">
          <span class="post-card__title text-subtext-w6">${title}</span>
          <span class="post-card__count"><i class="icon icon-humidity-high-filled icon--sm"></i><span class="text-overline-w6">${count}</span></span>
        </div>
        <span class="post-card__sub text-caption-w4">${author}</span>
      </div>
    `;
    return a;
  }

  /* 컬럼 폭 (배치 시 1회 측정) */
  const colWidth = columns[0].getBoundingClientRect().width;

  function appendBatch() {
    for (let i = 0; i < BATCH; i++) {
      const card = makeCard();
      const idx = shortestIdx();
      columns[idx].appendChild(card);
      /* 카드 높이 추정: 이미지(콜폭 × h/644) + 메타(약 64px) + gap(28) */
      const imgH = parseInt(card.querySelector('img').getAttribute('height'), 10);
      const cardH = (colWidth * imgH) / 644 + 64 + 28;
      colHeights[idx] += cardH;
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) appendBatch();
    });
  }, { rootMargin: '400px 0px' });

  observer.observe(sentinel);
})();

/* ============================================
   Hero ↔ Navbar 모드 전환

   스크롤이 hero 영역을 완전히 통과하면(.navbar 가 hero 밖으로 나옴) navbar 를
   navbar--on-dark(투명·흰색 텍스트) → 기본(흰 배경·어두운 텍스트) 로 전환.
   IntersectionObserver 로 hero 의 마지막 픽셀이 viewport 에서 벗어나는 시점 감지.
   ============================================ */
(function () {
  const navbar = document.querySelector('.navbar');
  const hero = document.querySelector('.main-home__hero');
  if (!navbar || !hero) return;

  // hero 가 viewport 와 겹치면 on-dark, 완전히 위로 사라지면 일반 모드.
  // rootMargin top: -<navbar 높이>px → navbar 가 가린 영역까지 덮인 것으로 간주
  const navbarH = navbar.offsetHeight || 64;
  const ghostBtn = navbar.querySelector('.btn-ghost-dark');
  const logo = navbar.querySelector('.logo-funfan');
  const setOnDark = (onDark) => {
    navbar.classList.toggle('navbar--on-dark', onDark);
    if (logo) logo.classList.toggle('logo--white', onDark);
    if (ghostBtn) {
      ghostBtn.classList.toggle('btn-ghost-dark', onDark);
      ghostBtn.classList.toggle('btn-ghost', !onDark);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => setOnDark(entry.isIntersecting));
  }, {
    rootMargin: `-${navbarH}px 0px 0px 0px`,
    threshold: 0,
  });
  observer.observe(hero);
})();

/* ============================================
   Hero Parallax — 두 레이어 시차 스크롤
   - hero-bg (이미지 + 그라디언트 묶음): 0.5x 속도 (페이지보다 천천히 — 깊이감)
   - 콘텐츠(텍스트 + 버튼): 0.3x 속도 (더 천천히 — viewport 에 오래 머무름)
   * 콘텐츠는 transform 대신 top 으로 이동 — ancestor transform 이 자식 .btn-glass 의
     backdrop-filter 를 깨뜨리는 것을 방지
   ============================================ */
(function () {
  const hero = document.querySelector('.main-home__hero');
  if (!hero) return;
  const heroBg = hero.querySelector('.main-home__hero-bg');
  const overlay = hero.querySelector('.main-home__hero-overlay');
  const content = hero.querySelector('.main-home__hero-content');
  if (!heroBg && !content) return;

  let ticking = false;
  let lastDarken = -1;
  const update = () => {
    const y = window.scrollY;
    const heroH = hero.offsetHeight || 800;
    /* 픽셀 단위로 라운딩 — sub-pixel 보간으로 인한 떨림(jitter) 방지 */
    if (heroBg) heroBg.style.transform = `translate3d(0, ${Math.round(y * 0.5)}px, 0)`;
    if (content) content.style.top = `${Math.round(y * 0.3)}px`;
    /* 그라디언트 darken — heroH 도달 시 1.00 (완전 검정). 0.01 단위로 양자화 + 변경 시에만 set (overlay 매 프레임 repaint 방지) */
    if (overlay) {
      const progress = Math.min(1, y / heroH);
      const darken = Math.round(progress * 100) / 100; // 0 ~ 1.00, 0.01 step
      if (darken !== lastDarken) {
        overlay.style.setProperty('--hero-darken', String(darken));
        lastDarken = darken;
      }
    }
    ticking = false;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
