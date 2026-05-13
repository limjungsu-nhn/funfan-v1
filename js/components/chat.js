/* ============================================
   Chat Component — AI 채팅 인터랙션 공용 모듈
   ---------------------------------------------
   사용법:
     <script src="js/components/chat.js" defer></script>
     <script>
       Chat.setup({
         root: document.querySelector('.right-panel'),
         getReply: (text) => '답변 문자열',
       });
     </script>

   API:
     Chat.typeText(el, text, scrollEl, onDone, speed)
       - el에 한 글자씩 타이핑해서 text를 채움
     Chat.appendBotMessage(chatArea)
       - .chat-msg.chat-msg--new 버블을 append, .chat-msg__text 반환
     Chat.appendMyMessage(chatArea, text)
       - .my-msg 버블을 append
     Chat.setup({ root, getReply, replyDelay = 400, onReplyComplete })
       - textarea·sendBtn·suggestions 전체 배선
       - suggestion chips 자동 바인딩 포함
       - onReplyComplete: 봇 답변 타이핑 완료 시 호출 (선택)
   ============================================ */

window.Chat = (() => {
  const TYPE_SPEED      = 30;   // ms per character
  const DEFAULT_DELAY   = 400;  // ms before bot reply
  const TEXTAREA_MIN    = 32;   // px
  const TEXTAREA_MAX    = 120;  // px

  /* 창작 파트너 — 모달 「創作パートナー設定」 의 라디오 선택값과 동기화.
     panel-header HTML 의 초기 마크업 (.avatar-{name})을 우선 읽고, 없으면 'hana' 기본값.
     setPartner(name) 호출 시 panel-header / textarea placeholder 동기화 + appendBotMessage 의 아바타도 갱신. */
  const VALID_PARTNERS = ['tonton', 'hana', 'fuku'];
  const PARTNER_NAMES  = { tonton: 'トントン', hana: 'はな', fuku: 'ふく' };
  const PARTNER_SUBTEXTS = { tonton: 'こころほぐし師', hana: '漫画鑑定士', fuku: '構造アドバイザー' };
  let currentPartner = (() => {
    const av = document.querySelector('.right-panel .panel-header .avatar');
    if (av) {
      for (const p of VALID_PARTNERS) if (av.classList.contains('avatar-' + p)) return p;
    }
    return 'hana';
  })();

  function setPartner(name) {
    if (!VALID_PARTNERS.includes(name)) return;
    currentPartner = name;
    /* 1) panel-header 의 아바타 클래스 갱신 */
    document.querySelectorAll('.right-panel .panel-header .avatar').forEach((el) => {
      VALID_PARTNERS.forEach((p) => el.classList.remove('avatar-' + p));
      el.classList.add('avatar-' + name);
    });
    /* 2) panel-header 의 이름 갱신 */
    const nameEl = document.querySelector('.right-panel .panel-header .panel-header__name');
    if (nameEl) nameEl.textContent = PARTNER_NAMES[name];
    /* 3) panel-header 의 서브텍스트(직책) 갱신 — 가능한 경우 */
    const subEl = document.querySelector('.right-panel .panel-header .panel-header__subtext');
    if (subEl && PARTNER_SUBTEXTS[name]) subEl.textContent = PARTNER_SUBTEXTS[name];
    /* 4) chat-input placeholder 갱신 */
    const ta = document.querySelector('.right-panel .chat-input__textarea');
    if (ta) ta.setAttribute('placeholder', PARTNER_NAMES[name] + 'に話しかけてみましょう...');
  }

  /* 모달「話し方を変更する」 클릭 시 라디오 선택값으로 파트너 변경 + 모달 닫기 */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#modal-panel-setting .btn-filled-nature');
    if (!btn) return;
    const checked = document.querySelector('#modal-panel-setting input[name="modal-panel-partner"]:checked');
    if (!checked) return;
    setPartner(checked.value);
    const closeBtn = document.querySelector('#modal-panel-setting [data-modal-close]');
    if (closeBtn) closeBtn.click();
  });

  /* 모달 오픈 트리거 클릭 시점에 라디오 체크 상태를 현재 파트너로 동기화.
     defer 로딩 순서상 chat.js 가 modal.js 보다 먼저라서 이 핸들러가 먼저 실행됨 → 라디오 갱신 후 모달 오픈. */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open="#modal-panel-setting"]');
    if (!opener) return;
    document.querySelectorAll('#modal-panel-setting input[name="modal-panel-partner"]').forEach((r) => {
      r.checked = (r.value === currentPartner);
    });
  });

  const MY_MSG_TAIL_SVG =
    '<svg class="my-msg__tail" width="16" height="11" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0 0H12L15.111 9.33315C15.4129 10.2387 14.4188 11.027 13.6059 10.5267C10.9214 8.87468 7.83106 8 4.67894 8H0V0Z"/>' +
    '</svg>';

  function typeText(el, text, scrollEl, onDone, speed = TYPE_SPEED) {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
  }

  function appendBotMessage(chatArea) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--new';
    wrap.innerHTML =
      '<div class="chat-msg__header"><i class="avatar avatar-' + currentPartner + ' avatar--sm"></i></div>' +
      '<div class="chat-msg__body"><p class="chat-msg__text"></p></div>';
    chatArea.appendChild(wrap);
    chatArea.scrollTop = chatArea.scrollHeight;
    return wrap.querySelector('.chat-msg__text');
  }

  function appendMyMessage(chatArea, text) {
    const wrap = document.createElement('div');
    wrap.className = 'my-msg';
    wrap.innerHTML =
      '<div class="my-msg__bubble">' +
        '<p class="my-msg__text">' + text.replace(/</g, '&lt;') + '</p>' +
        MY_MSG_TAIL_SVG +
      '</div>';
    chatArea.appendChild(wrap);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function setup({ root, getReply, replyDelay = DEFAULT_DELAY, onReplyComplete }) {
    if (!root) return null;

    const textarea    = root.querySelector('.chat-input__textarea');
    const sendBtn     = root.querySelector('.send-btn');
    const chatArea    = root.querySelector('.right-panel__chat') ||
                        root.querySelector('[data-chat-area]');
    const suggestions = root.querySelector('.right-panel__suggestions');

    if (!textarea || !sendBtn || !chatArea) return null;

    let isWaiting = false;

    // textarea 자동 높이
    textarea.addEventListener('input', () => {
      textarea.style.height = TEXTAREA_MIN + 'px';
      textarea.style.height = Math.min(textarea.scrollHeight, TEXTAREA_MAX) + 'px';
    });

    async function sendMessage() {
      if (isWaiting) return;
      const text = textarea.value.trim();
      if (!text) return;

      isWaiting = true;
      sendBtn.disabled = true;

      appendMyMessage(chatArea, text);
      if (suggestions) suggestions.style.display = 'none';

      textarea.value = '';
      textarea.style.height = TEXTAREA_MIN + 'px';
      textarea.focus();

      setTimeout(() => {
        const botTextEl = appendBotMessage(chatArea);
        const reply = getReply(text);
        typeText(botTextEl, reply, chatArea, () => {
          isWaiting = false;
          sendBtn.disabled = false;
          if (onReplyComplete) onReplyComplete();
        });
      }, replyDelay);
    }

    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', (e) => {
      /* IME 조합 중(한글/일본어/중국어 등) Enter 는 입력기 확정 신호 → sendMessage 호출 차단.
         e.isComposing: 모던 API, keyCode 229: IME active 시 일부 브라우저 fallback */
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Suggestion chips — 이벤트 위임
    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.msg-bubble');
        if (!chip) return;
        textarea.value = chip.querySelector('span')?.textContent || chip.textContent;
        sendMessage();
        textarea.blur();
        suggestions.style.display = 'none';
      });
    }

    // 초기 스크롤을 가장 아래로
    chatArea.scrollTop = chatArea.scrollHeight;

    return { sendMessage, chatArea, textarea, sendBtn };
  }

  return { typeText, appendBotMessage, appendMyMessage, setup, setPartner, getPartner: () => currentPartner };
})();
