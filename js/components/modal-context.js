/* ============================================
   Modal Context (作品コンテキストを追加) — 데이터 기반 SSOT 모듈

   목적:
     - "+" 버튼([data-modal-open="#modal-context"])이 있는 모든 페이지 공유.
     - 데이터(works/story/characters) 기반으로 동적 렌더 → 빈/채워짐 상태 자동 분기.
     - React 이식 시 <ModalContext /> 컴포넌트로 1:1 매핑.

   사용법:
     ModalContext.init({
       works: [{ id, title, sub }],
       selectedWorkId: 'adventure',
       story: { theme, episodes, summary } | null,    // null → 빈 add-slot
       characters: [{ id, name, age, gender, personality, role }],  // [] → 빈 add-slot
       onSelectWork:      (id)   => {},
       onSaveStory:       (data) => {},
       onSaveCharacter:   (data) => {},  // data.id 있으면 edit, 없으면 new
       onDeleteCharacter: (id)   => {},
     });

   인스턴스:
     instance.getState()       // 현재 상태 (얕은 복사)
     instance.setData(partial) // 데이터 갱신 + 즉시 re-render
     instance.destroy()        // 이벤트 해제 + DOM 제거

   순수 함수: ModalContext._internal — 단위 테스트/검증용
   ============================================ */
(function (root) {
  'use strict';

  // ── Default sample data — pages that don't pass init() get this ──
  const DEFAULT_WORKS = [
    { id: 'adventure', title: '私の冒険',          sub: '連載中・3話公開・主人公ハルの設定あり' },
    { id: 'kitchen',   title: '夜明けのキッチン',  sub: '準備中・0話公開・ストーリーアーク未登録' },
    { id: 'moon',      title: '月の手紙',          sub: '下書き・1話作成中・サブキャラ設定を追加予定' },
    { id: 'forest',    title: '森の声',            sub: '連載中・5話公開・世界観メモあり' },
    { id: 'rain',      title: '雨上がりの街',      sub: '準備中・プロット作成中' },
    { id: 'star',      title: '星屑の約束',        sub: '下書き・2話作成中・キャラ3名登録済' },
    { id: 'cafe',      title: '午後三時のカフェ',  sub: '連載中・8話公開・短編集' },
    { id: 'wind',      title: '風の通り道',        sub: '準備中・舞台設定リサーチ中' },
    { id: 'window',    title: '窓辺の猫',          sub: '連載中・12話公開・人気作' },
  ];

  // 데모용 — 초기 상태에서 채워진 화면을 보여주기 위한 샘플
  const DEFAULT_STORY = {
    theme: 'テーマ・方向性',
    episodes: '30話完結予定',
    summary: '作品のあらすじ作品のあらすじ作品のあらすじ作品のあらすじあらすじあすじあすじあらすじすじあすじあ',
  };
  const DEFAULT_CHARACTERS = [
    { id: 1, name: 'キャラクター１', age: '', gender: '', personality: '', role: 'キャラクターの役割' },
    { id: 2, name: 'キャラクター２', age: '', gender: '', personality: '', role: 'キャラクターの役割' },
  ];

  // ── escape ──
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
    ));
  }

  // ── Pure helpers (테스트 가능) ──
  function isStoryEmpty(story) { return !story; }
  function hasCharacters(chars) { return Array.isArray(chars) && chars.length > 0; }
  function nextCharacterId(chars) {
    return (chars.reduce((m, c) => Math.max(m, c.id || 0), 0)) + 1;
  }
  function findWork(works, id) { return works.find((w) => w.id === id) || null; }
  function findCharacter(chars, id) { return chars.find((c) => c.id === id) || null; }

  // ── Render: STEP 1 — 작품 선택 ──
  function renderWorkRadioCard(work, selectedId) {
    const checked = work.id === selectedId ? ' checked' : '';
    return ''
      + '<label class="radio-card radio-card--nav">'
      +   '<input type="radio" class="radio-card__input" name="modal-context-work" value="' + esc(work.id) + '"' + checked + '>'
      +   '<div class="radio-card__content">'
      +     '<span class="radio-card__title">' + esc(work.title) + '</span>'
      +     '<span class="radio-card__sub">' + esc(work.sub) + '</span>'
      +   '</div>'
      +   '<i class="icon icon-chevron-right radio-card__chevron"></i>'
      + '</label>';
  }

  function renderStep1(state) {
    return ''
      + '<div class="modal__step">'
      +   '<div class="modal__section">'
      +     '<label class="modal__label">作品を選ぶ</label>'
      +     '<div class="modal__list">'
      +       state.works.map((w) => renderWorkRadioCard(w, state.selectedWorkId)).join('')
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── Render: STEP 2 — 작품 선택 후 ストーリー/キャラクター 진입 ──
  function renderSummaryCard(work) {
    if (!work) return '';
    return ''
      + '<div class="modal__summary-card">'
      +   '<div class="modal__summary-card__content">'
      +     '<span class="modal__summary-card__title">' + esc(work.title) + '</span>'
      +     '<span class="modal__summary-card__sub">' + esc(work.sub) + '</span>'
      +   '</div>'
      +   '<button class="btn btn-line btn--sm" type="button" data-modal-goto="1"><span>作品を選び直す</span></button>'
      + '</div>';
  }

  function renderStorySection(story) {
    if (isStoryEmpty(story)) {
      return ''
        + '<div class="modal__field">'
        +   '<label class="modal__label">ストーリーアーク</label>'
        +   '<button class="modal__add-slot" type="button" data-modal-goto="3" data-tab-target="story" data-edit-mode="story-new" aria-label="ストーリーアークを追加">'
        +     '<i class="icon icon-add"></i>'
        +   '</button>'
        + '</div>';
    }
    return ''
      + '<div class="modal__field">'
      +   '<label class="modal__label">ストーリーアーク</label>'
      +   '<div class="modal__entity-row">'
      +     '<div class="modal__entity-row__content">'
      +       '<div class="modal__entity-row__heading">'
      +         '<span class="modal__entity-row__title">' + esc(story.theme) + '</span>'
      +         '<span class="modal__entity-row__sub">' + esc(story.episodes) + '</span>'
      +       '</div>'
      +       '<p class="modal__entity-row__desc">' + esc(story.summary) + '</p>'
      +     '</div>'
      +     '<button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3" data-tab-target="story" data-edit-mode="story-edit"><span>編集</span></button>'
      +   '</div>'
      + '</div>';
  }

  function renderCharacterEntityRow(c) {
    return ''
      + '<div class="modal__entity-row">'
      +   '<div class="modal__entity-row__content">'
      +     '<span class="modal__entity-row__title">' + esc(c.name) + '</span>'
      +     '<span class="modal__entity-row__sub">' + esc(c.role) + '</span>'
      +   '</div>'
      +   '<button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3" data-tab-target="character" data-edit-mode="character-edit" data-edit-id="' + esc(c.id) + '"><span>編集</span></button>'
      + '</div>';
  }

  function renderCharacterSection(characters) {
    const addSlot = ''
      + '<button class="modal__add-slot" type="button" data-modal-goto="3" data-tab-target="character" data-edit-mode="character-new" aria-label="キャラクターを追加">'
      +   '<i class="icon icon-add"></i>'
      + '</button>';
    if (!hasCharacters(characters)) {
      return ''
        + '<div class="modal__field">'
        +   '<label class="modal__label">キャラクター情報</label>'
        +   addSlot
        + '</div>';
    }
    return ''
      + '<div class="modal__field">'
      +   '<label class="modal__label">キャラクター情報</label>'
      +   '<div class="modal__field__list">'
      +     characters.map(renderCharacterEntityRow).join('')
      +     addSlot
      +   '</div>'
      + '</div>';
  }

  function renderStep2(state) {
    return ''
      + '<div class="modal__step">'
      +   renderSummaryCard(findWork(state.works, state.selectedWorkId))
      +   renderStorySection(state.story)
      +   renderCharacterSection(state.characters)
      + '</div>';
  }

  // ── Render: STEP 3 — 입력 폼 (story / character 별 패널) ──
  function renderStoryPanel(story, hidden) {
    const s = story || {};
    const hiddenAttr = hidden ? ' hidden' : '';
    return ''
      + '<div class="modal__tab-panel" data-tab-panel="story"' + hiddenAttr + '>'
      +   '<div class="modal__form">'
      +     '<div class="modal__field-group">'
      +       '<label class="modal__label">ストーリーアーク</label>'
      +       '<div class="modal__field-row">'
      +         '<div class="form-input"><input class="form-input__field" name="theme" type="text" placeholder="テーマ・方向性" value="' + esc(s.theme || '') + '"></div>'
      +         '<div class="form-input form-input--narrow"><input class="form-input__field" name="episodes" type="text" placeholder="完結予定話数" value="' + esc(s.episodes || '') + '"></div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="form-textarea">'
      +       '<textarea class="form-textarea__field" name="summary" placeholder="あらすじ">' + esc(s.summary || '') + '</textarea>'
      +     '</div>'
      +   '</div>'
      +   '<div class="modal__footer">'
      +     '<button class="btn btn-line btn--sm" type="button" data-modal-back><span>キャンセル</span></button>'
      +     '<button class="btn btn-filled-nature btn--sm" type="button" data-save="story"><span>保存する</span></button>'
      +   '</div>'
      + '</div>';
  }

  function renderCharacterPanel(character, hidden) {
    const c = character || {};
    const isEdit = !!character;
    const hiddenAttr = hidden ? ' hidden' : '';
    const footer = isEdit
      ? ''
        + '<div class="modal__footer modal__footer--split">'
        +   '<button class="btn btn-soft-red btn--sm" type="button" data-delete="character"><span>削除</span></button>'
        +   '<div class="modal__footer__group">'
        +     '<button class="btn btn-line btn--sm" type="button" data-modal-back><span>キャンセル</span></button>'
        +     '<button class="btn btn-filled-nature btn--sm" type="button" data-save="character"><span>保存する</span></button>'
        +   '</div>'
        + '</div>'
      : ''
        + '<div class="modal__footer">'
        +   '<button class="btn btn-line btn--sm" type="button" data-modal-back><span>キャンセル</span></button>'
        +   '<button class="btn btn-filled-nature btn--sm" type="button" data-save="character"><span>保存する</span></button>'
        + '</div>';
    return ''
      + '<div class="modal__tab-panel" data-tab-panel="character"' + hiddenAttr + '>'
      +   '<div class="modal__form">'
      +     '<div class="modal__field-group">'
      +       '<label class="modal__label">キャラクター情報</label>'
      +       '<div class="modal__field-row">'
      +         '<div class="form-input"><input class="form-input__field" name="name" type="text" placeholder="キャラクター名" value="' + esc(c.name || '') + '"></div>'
      +         '<div class="form-input"><input class="form-input__field" name="age" type="text" placeholder="年齢/学年" value="' + esc(c.age || '') + '"></div>'
      +         '<div class="form-input"><input class="form-input__field" name="gender" type="text" placeholder="性別" value="' + esc(c.gender || '') + '"></div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="form-textarea">'
      +       '<textarea class="form-textarea__field" name="personality" placeholder="性格">' + esc(c.personality || '') + '</textarea>'
      +     '</div>'
      +     '<div class="form-input"><input class="form-input__field" name="role" type="text" placeholder="役割" value="' + esc(c.role || '') + '"></div>'
      +   '</div>'
      +   footer
      + '</div>';
  }

  function renderStep3(state) {
    const isStory = state.editingMode === 'story-new' || state.editingMode === 'story-edit';
    const editingChar = state.editingMode === 'character-edit' && state.editingId != null
      ? findCharacter(state.characters, state.editingId)
      : null;
    // editingMode 에 따라 어느 패널이 visible 인지 결정 — 기본(null/character-*) 은 character 패널 표시
    return ''
      + '<div class="modal__step">'
      +   renderStoryPanel(state.story, !isStory)
      +   renderCharacterPanel(editingChar, isStory)
      + '</div>';
  }

  // ── Init ──
  function init(opts) {
    const o = opts || {};
    const state = {
      works: o.works || DEFAULT_WORKS,
      selectedWorkId: o.selectedWorkId || null,
      story: o.story === undefined ? null : o.story,
      characters: o.characters || [],
      editingMode: null, // 'story-new' | 'story-edit' | 'character-new' | 'character-edit'
      editingId: null,   // 캐릭터 편집 시 id (story 는 단일이라 항상 null)
    };
    const cb = {
      onSelectWork:      typeof o.onSelectWork      === 'function' ? o.onSelectWork      : function () {},
      onSaveStory:       typeof o.onSaveStory       === 'function' ? o.onSaveStory       : function () {},
      onSaveCharacter:   typeof o.onSaveCharacter   === 'function' ? o.onSaveCharacter   : function () {},
      onDeleteCharacter: typeof o.onDeleteCharacter === 'function' ? o.onDeleteCharacter : function () {},
    };

    // 모달 컨테이너 (id="modal-context") 가 없으면 body 끝에 주입
    let backdrop = document.getElementById('modal-context');
    if (!backdrop) {
      const wrap = document.createElement('div');
      wrap.innerHTML = ''
        + '<div class="modal-backdrop" id="modal-context">'
        +   '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-context-title">'
        +     '<h2 class="modal__title" id="modal-context-title">作品コンテキストを追加</h2>'
        +     '<button class="modal__close" type="button" aria-label="閉じる" data-modal-close>'
        +       '<i class="icon icon-close"></i>'
        +     '</button>'
        +     '<div class="modal__viewport">'
        +       '<div class="modal__track" data-step="1" data-step-count="3"></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
      while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
      backdrop = document.getElementById('modal-context');
    }
    const track = backdrop.querySelector('.modal__track');

    function setStepActive(stepNum) {
      const steps = track.querySelectorAll(':scope > .modal__step');
      steps.forEach((el, i) => {
        if (i === stepNum - 1) el.removeAttribute('inert');
        else el.setAttribute('inert', '');
      });
    }

    // 전체 재렌더 — init 시점 + save/delete 시 (step 2 의 entity-row 가 갱신되어야 하는 경우)
    function renderAll() {
      const current = parseInt(track.getAttribute('data-step') || '1', 10);
      track.innerHTML = renderStep1(state) + renderStep2(state) + renderStep3(state);
      setStepActive(current);
    }

    // 부분 재렌더 — 단일 step 만 outerHTML 교체. modal.js 의 inert / data-step / panel 토글을 보존.
    function rerenderStepN(n /* 1|2|3 */) {
      const steps = track.querySelectorAll(':scope > .modal__step');
      if (steps.length < n) return;
      const html = n === 1 ? renderStep1(state) : n === 2 ? renderStep2(state) : renderStep3(state);
      steps[n - 1].outerHTML = html;
    }

    // ── Event handlers ──
    // 핵심: modeBtn 매칭 시 step 3 만 부분 재렌더 → step 2 의 클릭 버튼은 DOM 에 그대로 남아
    // modal.js 의 gotoBtn.closest(.modal-backdrop) 가 정상 작동.
    function onClick(e) {
      // 1) Edit-mode tracking — step 3 에 진입할 때 폼 pre-fill
      const modeBtn = e.target.closest('[data-edit-mode]');
      if (modeBtn) {
        state.editingMode = modeBtn.getAttribute('data-edit-mode');
        const id = modeBtn.getAttribute('data-edit-id');
        state.editingId = id != null ? Number(id) : null;
        // step 3 만 부분 재렌더 — 클릭한 step 2 버튼은 DOM 에 유지 → modal.js goto 정상 작동
        rerenderStepN(3);
        return;
      }

      // 2) Save 버튼 — 폼 데이터 수집 후 state 갱신 + 콜백 + step 2 복귀 (전체 재렌더)
      const saveBtn = e.target.closest('[data-save]');
      if (saveBtn) {
        const kind = saveBtn.getAttribute('data-save');
        const panel = saveBtn.closest('.modal__tab-panel');
        if (!panel) return;
        const data = {};
        panel.querySelectorAll('input[name], textarea[name]').forEach((el) => {
          data[el.name] = el.value;
        });
        if (kind === 'story') {
          state.story = data;
          cb.onSaveStory(Object.assign({}, data));
        } else if (kind === 'character') {
          if (state.editingMode === 'character-edit' && state.editingId != null) {
            const idx = state.characters.findIndex((c) => c.id === state.editingId);
            if (idx >= 0) state.characters[idx] = Object.assign({}, state.characters[idx], data);
            cb.onSaveCharacter(Object.assign({ id: state.editingId }, data));
          } else {
            const newId = nextCharacterId(state.characters);
            const newChar = Object.assign({ id: newId }, data);
            state.characters.push(newChar);
            cb.onSaveCharacter(newChar);
          }
        }
        track.setAttribute('data-step', '2');
        state.editingMode = null;
        state.editingId = null;
        renderAll();
        return;
      }

      // 3) Delete 버튼 — character 편집 모드에서만 유효
      const deleteBtn = e.target.closest('[data-delete="character"]');
      if (deleteBtn && state.editingMode === 'character-edit' && state.editingId != null) {
        const id = state.editingId;
        state.characters = state.characters.filter((c) => c.id !== id);
        cb.onDeleteCharacter(id);
        track.setAttribute('data-step', '2');
        state.editingMode = null;
        state.editingId = null;
        renderAll();
        return;
      }
    }

    function onChange(e) {
      // 작품 선택 (radio change) — modal.js 가 step 2 로 자동 전진. 우리는 step 2 만 부분 재렌더.
      if (e.target.matches('input[name="modal-context-work"]')) {
        state.selectedWorkId = e.target.value;
        // 데모용: 'kitchen'(2번째 카드 — 夜明けのキッチン) 선택 시 채워진 상태 표시, 그 외는 빈 상태
        if (state.selectedWorkId === 'kitchen') {
          state.story = Object.assign({}, DEFAULT_STORY);
          state.characters = DEFAULT_CHARACTERS.map((c) => Object.assign({}, c));
        } else {
          state.story = null;
          state.characters = [];
        }
        cb.onSelectWork(state.selectedWorkId);
        rerenderStepN(2);
      }
    }

    backdrop.addEventListener('click', onClick);
    backdrop.addEventListener('change', onChange);
    renderAll();

    return {
      getState: () => Object.assign({}, state, { characters: state.characters.slice() }),
      setData: (partial) => {
        if (!partial) return;
        if (partial.works !== undefined)          state.works = partial.works;
        if (partial.selectedWorkId !== undefined) state.selectedWorkId = partial.selectedWorkId;
        if (partial.story !== undefined)          state.story = partial.story;
        if (partial.characters !== undefined)     state.characters = partial.characters;
        renderAll();
      },
      destroy: () => {
        backdrop.removeEventListener('click', onClick);
        backdrop.removeEventListener('change', onChange);
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      },
    };
  }

  // ── Auto-init — 페이지가 직접 init() 안 부르면 빈 상태로 자동 시동 ──
  // step 1: 작품 미선택 / step 2: story null + characters [] → 둘 다 add-slot 만 노출
  function autoInit() {
    if (root.__modalContextInstance) return;
    root.__modalContextInstance = init({
      selectedWorkId: null,
      story: null,
      characters: [],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // ── Public ──
  root.ModalContext = {
    init,
    _internal: { isStoryEmpty, hasCharacters, nextCharacterId, findWork, findCharacter },
  };
})(window);
