/* ============================================
   Avatar Upload — 업로드 버튼 클릭 → 파일 선택 팝업

   HTML은 기존 구조 그대로 (별도 input 태그 불필요).
   JS가 각 .avatar-upload 에 hidden <input type="file"> 을 주입하고
   버튼 클릭 → input.click() 으로 OS 파일 선택 다이얼로그를 띄움.
   파일이 선택되면 FileReader로 preview 이미지를 갱신.

   허용 포맷: JPG / PNG / WEBP (accept 속성)
   ============================================ */

(function () {
  'use strict';

  const ACCEPT = 'image/jpeg,image/png,image/webp';

  function init(root) {
    const scope = root || document;
    const blocks = scope.querySelectorAll('.avatar-upload');

    blocks.forEach((block) => {
      if (block.dataset.avatarUploadBound === '1') return;
      block.dataset.avatarUploadBound = '1';

      const button = block.querySelector('.avatar-upload__body button');
      if (!button) return;

      // hidden file input 주입
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = ACCEPT;
      input.hidden = true;
      input.className = 'avatar-upload__input';
      block.appendChild(input);

      button.addEventListener('click', (e) => {
        e.preventDefault();
        input.click();
      });

      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;

        const preview = block.querySelector('.avatar-upload__preview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          let img = preview.querySelector('.avatar-upload__image');
          if (!img) {
            img = document.createElement('img');
            img.className = 'avatar-upload__image';
            img.alt = '';
            preview.appendChild(img);
          }
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  window.AvatarUpload = { init };
})();
