/* ============================================
   Modal Context (작품コンテキストを追加) — 공통 모달 SSOT

   목적:
     - "+" 버튼([data-modal-open="#modal-context"])이 있는 모든 페이지에서 공유.
     - 모달 마크업을 페이지마다 복제하지 않고 이 파일 하나로 관리 → 변경 시 자동 반영.
     - React 이식 시 <ModalContext /> 컴포넌트로 1:1 매핑.

   동작:
     - DOMContentLoaded 시 body 끝에 모달 HTML 주입.
     - 이미 #modal-context 가 페이지에 존재하면 주입 생략 (이중 주입 방지).
     - 동작 로직(open/close/step/tab)은 modal.js 가 처리.
   ============================================ */
(function () {
  'use strict';

  const MODAL_HTML = `
      <!-- Modal: 作品コンテキストを追加 -->
      <div class="modal-backdrop" id="modal-context">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-context-title">
          <h2 class="modal__title" id="modal-context-title">作品コンテキストを追加</h2>
          <button class="modal__close" type="button" aria-label="閉じる" data-modal-close>
            <i class="icon icon-close"></i>
          </button>
          <div class="modal__viewport">
          <div class="modal__track" data-step="1" data-step-count="3">
    
          <!-- ============ STEP 1: 작품 선택 ============ -->
          <div class="modal__step">
          <div class="modal__section">
            <label class="modal__label">作品を選ぶ</label>
            <div class="modal__list">
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="adventure">
                <div class="radio-card__content">
                  <span class="radio-card__title">私の冒険</span>
                  <span class="radio-card__sub">連載中・3話公開・主人公ハルの設定あり</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="kitchen">
                <div class="radio-card__content">
                  <span class="radio-card__title">夜明けのキッチン</span>
                  <span class="radio-card__sub">準備中・0話公開・ストーリーアーク未登録</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="moon">
                <div class="radio-card__content">
                  <span class="radio-card__title">月の手紙</span>
                  <span class="radio-card__sub">下書き・1話作成中・サブキャラ設定を追加予定</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="forest">
                <div class="radio-card__content">
                  <span class="radio-card__title">森の声</span>
                  <span class="radio-card__sub">連載中・5話公開・世界観メモあり</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="rain">
                <div class="radio-card__content">
                  <span class="radio-card__title">雨上がりの街</span>
                  <span class="radio-card__sub">準備中・プロット作成中</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="star">
                <div class="radio-card__content">
                  <span class="radio-card__title">星屑の約束</span>
                  <span class="radio-card__sub">下書き・2話作成中・キャラ3名登録済</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="cafe">
                <div class="radio-card__content">
                  <span class="radio-card__title">午後三時のカフェ</span>
                  <span class="radio-card__sub">連載中・8話公開・短編集</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="wind">
                <div class="radio-card__content">
                  <span class="radio-card__title">風の通り道</span>
                  <span class="radio-card__sub">準備中・舞台設定リサーチ中</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
              <label class="radio-card radio-card--nav">
                <input type="radio" class="radio-card__input" name="modal-context-work" value="window">
                <div class="radio-card__content">
                  <span class="radio-card__title">窓辺の猫</span>
                  <span class="radio-card__sub">連載中・12話公開・人気作</span>
                </div>
                <i class="icon icon-chevron-right radio-card__chevron"></i>
              </label>
            </div>
          </div>
          </div><!-- /step 1 -->
    
          <!-- ============ STEP 2: 항목(キャラクター/ストーリー) 리스트 ============ -->
          <div class="modal__step">
            <div class="modal__summary-card">
              <div class="modal__summary-card__content">
                <span class="modal__summary-card__title">私の冒険</span>
                <span class="modal__summary-card__sub">連載中・3話公開・主人公ハルの設定あり</span>
              </div>
              <button class="btn btn-line btn--sm" type="button" data-modal-goto="1"><span>作品を選び直す</span></button>
            </div>
    
            <div class="modal__tabs">
              <div class="tab-group">
                <button class="tab tab--selected" type="button" data-tab-target="character">キャラクター情報</button>
                <button class="tab" type="button" data-tab-target="story">ストーリーアーク</button>
              </div>
            </div>
    
            <!-- Panel: キャラクター 리스트 -->
            <div class="modal__tab-panel" data-tab-panel="character">
              <p class="modal__helper">選択した作品に紐づくキャラクターのみ管理します。</p>
              <div class="modal__list">
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">キャラクター１</span>
                    <span class="modal__entity-row__sub">キャラクターの役割</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">イム・ジョンス</span>
                    <span class="modal__entity-row__sub">主人公の友達・帽子が好きな人</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">キム・ヒョンジン</span>
                    <span class="modal__entity-row__sub">主人公の友達・髪が短い人</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">パク・ミナ</span>
                    <span class="modal__entity-row__sub">クラス委員・几帳面な性格</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">チェ・ジウ</span>
                    <span class="modal__entity-row__sub">幼なじみ・お菓子作りが得意</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">カン・テヒョン</span>
                    <span class="modal__entity-row__sub">バスケ部・ライバルキャラ</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">ユン・ソヨン</span>
                    <span class="modal__entity-row__sub">図書委員・本が好きな静かな人</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
                <div class="modal__entity-row">
                  <div class="modal__entity-row__content">
                    <span class="modal__entity-row__title">ハン・ジュノ</span>
                    <span class="modal__entity-row__sub">転校生・謎多き存在</span>
                  </div>
                  <button class="btn btn-filled-gray btn--sm" type="button" data-modal-goto="3"><span>編集</span></button>
                </div>
              </div>
            </div>
    
            <!-- Panel: ストーリー 폼 (step 3 와 동일한 form — story 는 단일 항목이라 list 대신 form 노출) -->
            <div class="modal__tab-panel" data-tab-panel="story" hidden>
              <p class="modal__helper">現在の完成話数：3話。保存後は以降の会話で参照されます。</p>
              <div class="modal__form">
                <div class="modal__field-group">
                  <label class="modal__label">ストーリー設定</label>
                  <div class="modal__field-row">
                    <div class="form-input"><input class="form-input__field" type="text" placeholder="テーマ・方向性"></div>
                    <div class="form-input form-input--narrow"><input class="form-input__field" type="text" placeholder="完結予定話数"></div>
                  </div>
                </div>
                <div class="form-textarea">
                  <textarea class="form-textarea__field" placeholder="あらすじ"></textarea>
                </div>
              </div>
            </div>
    
            <div class="modal__footer">
              <button class="btn btn-filled-nature btn--sm" type="button" data-modal-goto="3">
                <i class="icon icon-add"></i><span>キャラクター追加</span>
              </button>
            </div>
          </div><!-- /step 2 -->
    
          <!-- ============ STEP 3: キャラクター/ストーリー 입력 폼 ============ -->
          <div class="modal__step">
            <div class="modal__summary-card">
              <div class="modal__summary-card__content">
                <span class="modal__summary-card__title">私の冒険</span>
                <span class="modal__summary-card__sub">連載中・3話公開・主人公ハルの設定あり</span>
              </div>
              <button class="btn btn-line btn--sm" type="button" data-modal-goto="1"><span>作品を選び直す</span></button>
            </div>
    
            <div class="modal__tabs">
              <div class="tab-group">
                <button class="tab tab--selected" type="button" data-tab-target="character">キャラクター情報</button>
                <button class="tab" type="button" data-tab-target="story">ストーリーアーク</button>
              </div>
            </div>
    
            <!-- Panel: キャラクター情報 -->
            <div class="modal__tab-panel" data-tab-panel="character">
              <p class="modal__helper">選択した作品に紐づくキャラクターのみ管理します。</p>
              <div class="modal__form">
                <div class="modal__field-group">
                  <label class="modal__label">キャラクター情報</label>
                  <div class="modal__field-row">
                    <div class="form-input"><input class="form-input__field" type="text" placeholder="キャラクター名"></div>
                    <div class="form-input"><input class="form-input__field" type="text" placeholder="年齢/学年"></div>
                    <div class="form-input"><input class="form-input__field" type="text" placeholder="性別"></div>
                  </div>
                </div>
                <div class="form-textarea">
                  <textarea class="form-textarea__field" placeholder="性格"></textarea>
                </div>
                <div class="form-input"><input class="form-input__field" type="text" placeholder="役割"></div>
              </div>
            </div>
    
            <!-- Panel: ストーリーアーク -->
            <div class="modal__tab-panel" data-tab-panel="story" hidden>
              <p class="modal__helper">現在の完成話数：3話。保存後は以降の会話で参照されます。</p>
              <div class="modal__form">
                <div class="modal__field-group">
                  <label class="modal__label">ストーリー設定</label>
                  <div class="modal__field-row">
                    <div class="form-input"><input class="form-input__field" type="text" placeholder="テーマ・方向性"></div>
                    <div class="form-input form-input--narrow"><input class="form-input__field" type="text" placeholder="完結予定話数"></div>
                  </div>
                </div>
                <div class="form-textarea">
                  <textarea class="form-textarea__field" placeholder="あらすじ"></textarea>
                </div>
              </div>
            </div>
    
            <div class="modal__footer modal__footer--split">
              <button class="btn btn-soft-red btn--sm" type="button" data-modal-back><span>削除</span></button>
              <div class="modal__footer__group">
                <button class="btn btn-line btn--sm" type="button" data-modal-back><span>キャンセル</span></button>
                <button class="btn btn-filled-nature btn--sm" type="button" data-modal-close><span>保存する</span></button>
              </div>
            </div>
          </div><!-- /step 3 -->
    
          </div><!-- /track -->
          </div><!-- /viewport -->
        </div>
      </div>
  `;

  function inject() {
    if (document.getElementById('modal-context')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = MODAL_HTML.trim();
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
