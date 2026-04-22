/* ============================================
   Form Input / Input Wood / Form Textarea
   — 컨테이너 클릭 시 내부 input/textarea 포커스

   문제:
     .form-input, .input-wood 등은 컨테이너에 padding(12px)이 있고 input은 padding 0.
     padding/여백 영역을 클릭하면 input에 포커스가 걸리지 않음.

   해결:
     컨테이너의 mousedown을 잡아 자식 input/textarea로 포커스 위임.
     - 클릭 지점이 input 바운딩 박스 내부 → 브라우저 기본 동작 유지 (caret 위치 유지)
     - 클릭 지점이 input 밖(padding/여백) → focus + caret을 값 끝으로 이동
       (그냥 focus()만 하면 브라우저마다 caret이 맨 앞에 가는 현상 발생)
     - 내부 button/a/label 클릭은 무시 (chat-input 같은 복합 컴포넌트 고려)
     - disabled / readonly 필드는 스킵
   ============================================ */

(function () {
  const SELECTORS = ['.form-input', '.input-wood', '.form-textarea'];
  const IGNORE = 'input, textarea, button, a, label, select';

  document.addEventListener('mousedown', (e) => {
    const container = e.target.closest(SELECTORS.join(','));
    if (!container) return;

    // 이미 인터랙티브 요소를 직접 클릭한 경우 → 브라우저 기본 동작 유지
    if (e.target.closest(IGNORE)) return;

    // disabled 컨테이너는 무시
    const name = SELECTORS.find((s) => container.matches(s)).slice(1);
    if (container.classList.contains(`${name}--disabled`)) return;

    const field = container.querySelector('input, textarea');
    if (!field || field.disabled) return;

    // 클릭 지점이 field 바운딩 박스 내부라면 브라우저가 caret을 정확히 놓도록 맡김
    const rect = field.getBoundingClientRect();
    const insideField =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (insideField) return;

    // padding/여백 클릭 → 포커스 후 caret을 값 끝으로
    e.preventDefault();
    field.focus({ preventScroll: true });
    if (!field.readOnly) {
      const len = field.value.length;
      try {
        field.setSelectionRange(len, len);
      } catch (_) {
        // type=email/number 등 setSelectionRange 미지원 input — focus만 적용
      }
    }
  });
})();
