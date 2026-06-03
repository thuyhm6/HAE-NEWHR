/**
 * ProcessingModal – global shared component
 *
 * API:
 *   ProcessingModal.show()              – hiển thị với text mặc định
 *   ProcessingModal.show('Đang lưu…')   – hiển thị với text tuỳ chỉnh
 *   ProcessingModal.hide()              – ẩn modal
 */
(function (global) {
    'use strict';

    var _bsModal = null;
    var _defaultText = '';

    function _getElement() {
        return document.getElementById('processingModal');
    }

    function _getInstance() {
        var el = _getElement();
        if (!el) return null;
        if (!_bsModal) {
            _bsModal = new bootstrap.Modal(el, { backdrop: 'static', keyboard: false });
        }
        return _bsModal;
    }

    function show(message) {
        var el = _getElement();
        if (!el) return;

        var msgEl = document.getElementById('processingModalMessage');
        if (msgEl) {
            if (message) {
                msgEl.textContent = message;
            } else if (_defaultText) {
                msgEl.textContent = _defaultText;
            }
        }

        var instance = _getInstance();
        if (instance) instance.show();
    }

    function hide() {
        var instance = _getInstance();
        if (instance) instance.hide();
    }

    function setDefaultText(text) {
        _defaultText = text || '';
    }

    global.ProcessingModal = { show: show, hide: hide, setDefaultText: setDefaultText };

}(window));
