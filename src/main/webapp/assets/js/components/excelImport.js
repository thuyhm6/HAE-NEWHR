/**
 * ExcelImport - Shared Excel Import Component
 *
 * Cách sử dụng:
 *   1. Đặt nút gọi: onclick="ExcelImport.open('/sy/excel/api/scheduleHtsv/upload', onSuccessCallback)"
 *   2. callback sẽ được gọi sau khi import thành công (ví dụ: reload table)
 *
 * Ví dụ:
 *   ExcelImport.open('/sy/excel/api/scheduleHtsv/upload', function() {
 *       table.ajax.reload();
 *   });
 */
var ExcelImport = (function () {
    var _uploadUrl = '';
    var _onSuccess = null;

    function open(uploadUrl, onSuccessCallback) {
        _uploadUrl = uploadUrl;
        _onSuccess = onSuccessCallback || function () {};

        // Reset trạng thái modal
        $('#excelImportFile').val('');
        $('#excelImportErrors').addClass('d-none').html('');
        $('#excelImportProgress').addClass('d-none');
        $('#excelImportBtn').prop('disabled', false);

        // Bind nút upload (gỡ event cũ để tránh duplicate)
        $('#excelImportBtn').off('click').on('click', function () {
            _doUpload();
        });

        // Hiện modal
        var modalEl = document.getElementById('excelImportModal');
        var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }

    function _doUpload() {
        var fileInput = document.getElementById('excelImportFile');
        if (!fileInput.files || fileInput.files.length === 0) {
            if (typeof toastr !== 'undefined') toastr.warning('Vui lòng chọn file Excel');
            else alert('Vui lòng chọn file Excel');
            return;
        }

        var formData = new FormData();
        formData.append('file', fileInput.files[0]);

        $('#excelImportErrors').addClass('d-none').html('');
        $('#excelImportProgress').removeClass('d-none');
        $('#excelImportBtn').prop('disabled', true);

        $.ajax({
            url: _uploadUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                $('#excelImportProgress').addClass('d-none');
                $('#excelImportBtn').prop('disabled', false);

                if (res.success) {
                    if (typeof toastr !== 'undefined') toastr.success(res.message);
                    else alert(res.message);

                    var modal = bootstrap.Modal.getInstance(document.getElementById('excelImportModal'));
                    if (modal) modal.hide();

                    if (typeof _onSuccess === 'function') _onSuccess(res);
                } else {
                    var errHtml = '<strong>' + (res.message || 'Import có lỗi') + '</strong>';
                    if (res.errors && res.errors.length) {
                        errHtml += '<ul class="mb-0 mt-1">';
                        res.errors.forEach(function (e) { errHtml += '<li>' + e + '</li>'; });
                        errHtml += '</ul>';
                    }
                    $('#excelImportErrors').html(errHtml).removeClass('d-none');

                    // Reload dù có lỗi (các dòng hợp lệ đã được insert)
                    if (typeof _onSuccess === 'function') _onSuccess(res);
                }
            },
            error: function () {
                $('#excelImportProgress').addClass('d-none');
                $('#excelImportBtn').prop('disabled', false);
                if (typeof toastr !== 'undefined') toastr.error('Lỗi kết nối khi upload file');
                else alert('Lỗi kết nối khi upload file');
            }
        });
    }

    return {
        open: open
    };
})();
