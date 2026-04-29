/* ============================================
   Page Attachment — 페이지 이미지 첨부 + 드래그&드롭 재정렬 + 가상 백지 페이지(左始まり)

   의존 CSS:
     - css/components/page-spread-grid.css
     - css/components/page-spread-preview.css
     - css/components/page-upload-zone.css
     - css/components/thumbnail-upload.css (empty state 사용 시)

   사용 예 (episode-add.html):
     const attachment = PageAttachment.init({
       emptyEl:    document.querySelector('[data-page-empty]'),
       attachedEl: document.querySelector('[data-page-attached]'),
       inputEl:    document.getElementById('page-files'),
       leftStart:  false,
       maxFiles: 100, maxFileSizeMB: 2, acceptedTypes: ['image/jpeg','image/png'],
       onChange: (files) => updateSubmitButton(files.length),
       onError:  ({ code, message }) => console.warn('[attachment]', code, message),
     });
     // 라디오 변경 시
     attachment.setLeftStart(value === 'left');
     // 페이지 이탈 시
     attachment.destroy();

   API:
     init(opts) → instance
       opts.emptyEl, attachedEl, inputEl  : 필수 DOM refs
       opts.leftStart                      : 左始まり 모드 (가상 백지 페이지 prepend)
       opts.maxFiles                       : 기본 100
       opts.maxFileSizeMB                  : 기본 2
       opts.acceptedTypes                  : 기본 ['image/jpeg','image/png']
       opts.onChange(files)                : 파일 변경 시 (얕은 복사본 전달)
       opts.onError({ code, message })     : 검증 실패 시. code: 'TYPE'|'SIZE'|'COUNT'

     instance.getFiles()         : 현재 파일 배열 (얕은 복사)
     instance.setLeftStart(bool) : 모드 변경 + 즉시 re-render
     instance.destroy()          : ObjectURL 해제 + 이벤트 해제 + DOM 비우기

   순수 함수 (PageAttachment._internal — 테스트/검증용):
     buildDisplayItems(files, { leftStart }) → displayItems
     buildSpreads(displayItems, totalFiles)  → spreads
     moveFile(files, srcIdx, targetIdx)      → next files (insert-and-shift)
     validateFile(file, { acceptedTypes, maxFileSizeMB }) → { ok, code?, message? }
   ============================================ */
(function (root) {
  'use strict';

  const COLS = 3;

  // ── Pure helpers ────────────────────────────────────────────

  function buildDisplayItems(files, { leftStart }) {
    const out = [];
    if (leftStart && files.length > 0) out.push({ blank: true, num: 1 });
    files.forEach((_, i) => out.push({ fileIdx: i, num: out.length + 1 }));
    return out;
  }

  function buildSpreads(displayItems, totalFiles) {
    const spreads = [];
    for (let i = 0; i < displayItems.length; i += 2) {
      const items = displayItems.slice(i, i + 2);
      const firstReal = items.find((it) => !it.blank);
      const start = firstReal ? firstReal.fileIdx : totalFiles;
      spreads.push({ start, items });
    }
    return spreads;
  }

  // insert-and-shift: src 위치의 파일을 target 위치로 이동
  // src 가 target 보다 앞이면 splice 후 인덱스 -1 보정
  function moveFile(files, srcIdx, targetIdx) {
    if (srcIdx === targetIdx || srcIdx + 1 === targetIdx) return files; // no-op
    const next = files.slice();
    const [moved] = next.splice(srcIdx, 1);
    const insertAt = srcIdx < targetIdx ? targetIdx - 1 : targetIdx;
    next.splice(insertAt, 0, moved);
    return next;
  }

  function validateFile(file, { acceptedTypes, maxFileSizeMB }) {
    if (acceptedTypes && acceptedTypes.length && !acceptedTypes.includes(file.type)) {
      return { ok: false, code: 'TYPE', message: '対応していないファイル形式です: ' + file.name };
    }
    if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
      return { ok: false, code: 'SIZE', message: file.name + ' は ' + maxFileSizeMB + 'MB を超えています' };
    }
    return { ok: true };
  }

  // ── Renderers ────────────────────────────────────────────────

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function realPageHtml(files, { fileIdx, num }) {
    const f = files[fileIdx];
    return ''
      + '<div class="page-spread-preview__page" draggable="true" data-page-idx="' + fileIdx + '">'
      +   '<img class="page-spread-preview__thumb" src="' + escapeHtml(f.url) + '" alt="">'
      +   '<span class="page-spread-preview__num">' + num + '</span>'
      +   '<i class="icon icon-drag-pan page-spread-preview__icon"></i>'
      +   '<button class="page-spread-preview__delete" type="button" data-delete-page="' + fileIdx + '" aria-label="このページを削除">'
      +     '<i class="icon icon-delete"></i>'
      +   '</button>'
      + '</div>';
  }

  function blankPageHtml({ num }) {
    return ''
      + '<div class="page-spread-preview__page page-spread-preview__page--blank">'
      +   '<span class="page-spread-preview__num">' + num + '</span>'
      +   '<span class="page-spread-preview__blank-label text-overline-w4">白紙ページ</span>'
      + '</div>';
  }

  function spreadHtml(files, { start, items }, idx) {
    // DOM 순서: [큰 num, 작은 num] (default flex ltr → 시각상 left=큰, right=작은)
    const order = items.length === 2 ? [items[1], items[0]] : items;
    // drop zone 매핑은 spread 안의 real page 개수 기준 — 가상 백지(left-start 첫 spread) 는 제외
    const realCount = items.filter((it) => !it.blank).length;
    return ''
      + '<div class="page-spread-preview" data-spread-start="' + start + '" data-spread-real-count="' + realCount + '">'
      +   '<div class="page-spread-preview__label text-overline-w6">' + (idx + 1) + '</div>'
      +   '<div class="page-spread-preview__pages">'
      +     order.map((it) => it.blank ? blankPageHtml(it) : realPageHtml(files, it)).join('')
      +   '</div>'
      + '</div>';
  }

  function uploadCellHtml() {
    return ''
      + '<div class="page-upload-zone" data-upload-cell>'
      +   '<button class="btn btn-line btn--sm page-upload-zone__btn" type="button" data-upload-more>'
      +     '<i class="icon icon-folder-open"></i>'
      +     '<span class="text-caption-w4">ページ追加</span>'
      +   '</button>'
      +   '<p class="page-upload-zone__hint text-overline-w4">JPG/PNG、各2MB以下、<br>最大100枚。</p>'
      + '</div>';
  }

  function placeholderCellHtml() {
    return '<div class="page-spread-grid__placeholder" aria-hidden="true"></div>';
  }

  // ── Koma layout (1박스=1이미지, 4-col LTR) ─────────────────────

  function komaCellHtml(files, { fileIdx, num }) {
    // 박스(.page-spread-preview)는 yoko 와 동일 컴포넌트 — 안에 1-page 만 포함
    // data-spread-start = fileIdx (drop zone 매핑용)
    const f = files[fileIdx];
    return ''
      + '<div class="page-spread-preview" data-spread-start="' + fileIdx + '">'
      +   '<div class="page-spread-preview__pages">'
      +     '<div class="page-spread-preview__page" draggable="true" data-page-idx="' + fileIdx + '">'
      +       '<img class="page-spread-preview__thumb" src="' + escapeHtml(f.url) + '" alt="">'
      +       '<span class="page-spread-preview__num">' + num + '</span>'
      +       '<i class="icon icon-drag-pan page-spread-preview__icon"></i>'
      +       '<button class="page-spread-preview__delete" type="button" data-delete-page="' + fileIdx + '" aria-label="このページを削除">'
      +         '<i class="icon icon-delete"></i>'
      +       '</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function komaPlaceholderHtml() {
    return '<div class="page-koma-grid__placeholder" aria-hidden="true"></div>';
  }

  // ── Instance factory ────────────────────────────────────────

  function init(opts) {
    const o = opts || {};
    const emptyEl = o.emptyEl;
    const attachedEl = o.attachedEl;
    const inputEl = o.inputEl;
    if (!emptyEl || !attachedEl || !inputEl) {
      console.warn('[PageAttachment] required DOM refs missing'); return null;
    }

    let leftStart = !!o.leftStart;
    const layout = o.layout === 'koma' ? 'koma' : 'spread'; // 'spread'(yoko 기본) | 'koma'(1셀=1이미지)
    const customCols = typeof o.cols === 'number' && o.cols > 0 ? Math.floor(o.cols) : null;
    // ?? 사용 — 0/빈배열을 "비활성" 의도로 명시할 수 있게 (|| 는 0 을 falsy 로 처리해 default 로 빠지는 함정)
    const maxFiles = o.maxFiles ?? 100;
    const maxFileSizeMB = o.maxFileSizeMB ?? 2;
    const acceptedTypes = o.acceptedTypes ?? ['image/jpeg', 'image/png'];
    const onChange = typeof o.onChange === 'function' ? o.onChange : function () {};
    const onError = typeof o.onError === 'function' ? o.onError : function () {};

    /** @type {{ file: File, url: string }[]} */
    let files = [];
    let dragSrcIdx = null;

    function emitChange() { onChange(files.slice()); }

    function clearDropZones() {
      attachedEl.querySelectorAll('[data-drop-zone]').forEach((el) => el.removeAttribute('data-drop-zone'));
    }

    function render() {
      if (files.length === 0) {
        emptyEl.hidden = false;
        attachedEl.hidden = true;
        attachedEl.innerHTML = '';
        return;
      }
      emptyEl.hidden = true;
      attachedEl.hidden = false;

      if (layout === 'koma') {
        // 1셀=1이미지 · LTR · spread 페어링/blank prepend 없음. 기본 5-col, opts.cols 로 override.
        const KOMA_COLS = customCols || 5;
        attachedEl.dataset.cols = String(KOMA_COLS); // CSS 가 cols 별 셀 폭 결정 가능
        const cells = files.map((_, i) => komaCellHtml(files, { fileIdx: i, num: i + 1 }));
        cells.push(uploadCellHtml());
        const padCount = (KOMA_COLS - (cells.length % KOMA_COLS)) % KOMA_COLS;
        for (let i = 0; i < padCount; i++) cells.push(komaPlaceholderHtml());
        const rows = [];
        for (let i = 0; i < cells.length; i += KOMA_COLS) {
          rows.push('<div class="page-koma-grid__row">' + cells.slice(i, i + KOMA_COLS).join('') + '</div>');
        }
        attachedEl.innerHTML = rows.join('');
        return;
      }

      // spread (yoko 기본): 2장씩 spread 페어링 · 3-col RTL · 左始まり 시 백지 prepend
      const displayItems = buildDisplayItems(files, { leftStart });
      const spreads = buildSpreads(displayItems, files.length);

      const cells = spreads.map((s, idx) => spreadHtml(files, s, idx));
      cells.push(uploadCellHtml());
      const padCount = (COLS - (cells.length % COLS)) % COLS;
      for (let i = 0; i < padCount; i++) cells.push(placeholderCellHtml());

      const rows = [];
      for (let i = 0; i < cells.length; i += COLS) {
        rows.push('<div class="page-spread-grid__row">' + cells.slice(i, i + COLS).join('') + '</div>');
      }
      attachedEl.innerHTML = rows.join('');
    }

    // ── Event handlers (명명 함수 — destroy 시 해제 가능) ──

    function onPickFiles() { inputEl.click(); }

    function onInputChange(e) {
      const picked = Array.from(e.target.files || []);
      e.target.value = '';
      let added = 0;
      for (const file of picked) {
        if (files.length + added >= maxFiles) {
          onError({ code: 'COUNT', message: '最大 ' + maxFiles + ' 枚までです' });
          break;
        }
        const v = validateFile(file, { acceptedTypes, maxFileSizeMB });
        if (!v.ok) { onError(v); continue; }
        files.push({ file, url: URL.createObjectURL(file) });
        added++;
      }
      if (added > 0) { render(); emitChange(); }
    }

    function onAttachedClick(e) {
      const delBtn = e.target.closest('[data-delete-page]');
      if (delBtn) {
        const idx = Number(delBtn.dataset.deletePage);
        const removed = files[idx];
        if (removed) URL.revokeObjectURL(removed.url);
        files.splice(idx, 1);
        render(); emitChange();
        return;
      }
      const more = e.target.closest('[data-upload-more]');
      if (more) inputEl.click();
    }

    function onDragStart(e) {
      // 백지(__page--blank) 는 drag 대상 아님
      const page = e.target.closest('.page-spread-preview__page');
      if (!page || page.classList.contains('page-spread-preview__page--blank')) return;
      dragSrcIdx = Number(page.dataset.pageIdx);
      // ghost 숨김 — 빈 1×1 투명 요소를 drag image 로 지정 → 원본만 30% 로 노출
      const ghost = document.createElement('div');
      ghost.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => ghost.remove(), 0);
      page.setAttribute('data-dragging', 'true');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(dragSrcIdx));
    }

    function onDragEnd(e) {
      const page = e.target.closest('.page-spread-preview__page');
      if (page) page.removeAttribute('data-dragging');
      clearDropZones();
      dragSrcIdx = null;
    }

    function onDragOver(e) {
      if (dragSrcIdx === null) return;
      // upload-zone 은 drop target 에서 제외 — 드래그 중 첨부 박스는 무시
      const cellTarget = e.target.closest('.page-spread-preview');
      if (!cellTarget) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearDropZones();

      if (layout === 'koma') {
        const rect = cellTarget.getBoundingClientRect();
        if (customCols === 1) {
          // 세로 적층 (タテ) — 박스 단위 top/bottom 2-zone
          const y = e.clientY - rect.top;
          cellTarget.dataset.dropZone = y < rect.height / 2 ? 'top' : 'bottom';
        } else {
          // 가로 배치 (코마) — 박스 단위 left/right 2-zone
          const x = e.clientX - rect.left;
          cellTarget.dataset.dropZone = x < rect.width / 2 ? 'left' : 'right';
        }
        return;
      }

      // spread: 스프레드 단위 left/center/right 3-zone
      const rect = cellTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;
      const zone = x < w / 3 ? 'left' : (x < (w * 2) / 3 ? 'center' : 'right');
      cellTarget.dataset.dropZone = zone;
    }

    function onDragLeave(e) {
      if (!attachedEl.contains(e.relatedTarget)) clearDropZones();
    }

    function onDrop(e) {
      if (dragSrcIdx === null) return;
      e.preventDefault();
      // upload-zone 은 drop target 제외 — spread 셀 위에서만 drop 처리
      const cellTarget = e.target.closest('.page-spread-preview');
      if (!cellTarget) { clearDropZones(); dragSrcIdx = null; return; }
      let target;

      if (layout === 'koma') {
        // 박스 단위 2-zone (가로 left/right · 세로 top/bottom)
        //   left/top    → idx     (이 박스 앞에 삽입)
        //   right/bottom → idx+1  (이 박스 뒤에 삽입)
        const idx = Number(cellTarget.dataset.spreadStart);
        const zone = cellTarget.dataset.dropZone;
        target = (zone === 'right' || zone === 'bottom') ? idx + 1 : idx;
      } else {
        // spread: 스프레드 단위 left/center/right 3-zone (real page 개수 기준)
        //   right zone  → start                (스프레드 시작 = 첫 real page 앞)
        //   center zone → start + (real==2?1:0) (real 2장이면 사이, 1장이면 right 와 동일 — 가상 백지 무시)
        //   left zone   → start + realCount    (스프레드 끝 = 마지막 real page 뒤)
        const start = Number(cellTarget.dataset.spreadStart);
        const realCount = Number(cellTarget.dataset.spreadRealCount) || 1;
        const zone = cellTarget.dataset.dropZone;
        target = zone === 'left'
          ? start + realCount
          : (zone === 'center' ? start + (realCount === 2 ? 1 : 0) : start);
      }

      const moved = moveFile(files, dragSrcIdx, target);
      const changed = moved !== files;
      dragSrcIdx = null;
      if (changed) { files = moved; render(); emitChange(); }
      else clearDropZones();
    }

    // ── Bind ────────────────────────────────────────────────
    const pickBtn = emptyEl.querySelector('[data-pick-files]');
    if (pickBtn) pickBtn.addEventListener('click', onPickFiles);
    inputEl.addEventListener('change', onInputChange);
    attachedEl.addEventListener('click', onAttachedClick);
    attachedEl.addEventListener('dragstart', onDragStart);
    attachedEl.addEventListener('dragend', onDragEnd);
    attachedEl.addEventListener('dragover', onDragOver);
    attachedEl.addEventListener('dragleave', onDragLeave);
    attachedEl.addEventListener('drop', onDrop);

    render();

    return {
      getFiles: () => files.slice(),
      setLeftStart: (v) => { leftStart = !!v; render(); },
      destroy: () => {
        files.forEach((f) => URL.revokeObjectURL(f.url));
        files = [];
        if (pickBtn) pickBtn.removeEventListener('click', onPickFiles);
        inputEl.removeEventListener('change', onInputChange);
        attachedEl.removeEventListener('click', onAttachedClick);
        attachedEl.removeEventListener('dragstart', onDragStart);
        attachedEl.removeEventListener('dragend', onDragEnd);
        attachedEl.removeEventListener('dragover', onDragOver);
        attachedEl.removeEventListener('dragleave', onDragLeave);
        attachedEl.removeEventListener('drop', onDrop);
        attachedEl.innerHTML = '';
      },
    };
  }

  // Public
  root.PageAttachment = {
    init,
    _internal: { buildDisplayItems, buildSpreads, moveFile, validateFile },
  };
})(window);
