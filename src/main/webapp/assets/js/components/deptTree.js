/**
 * Global Authorized Department Tree Component
 * Usage: DeptTree.init('#input_selector', function(selectedCodes) { ... });
 */
var DeptTree = (function ($) {
    var config = {
        api: '/ar/attendanceSettings/api/arSupervisor/authorized-departments',
        containerId: 'global_dept_tree_container',
        treeId: 'global_auth_dept_tree'
    };

    var state = {
        authDeptList: [],
        selectedCodes: [],
        currentInput: null,
        onSelectCallback: null,
        cascadeChildren: true,
        singleSelect: false
    };

    function init(inputSelector, callback, options) {
        state.currentInput = $(inputSelector);
        state.onSelectCallback = callback;
        state.cascadeChildren = !(options && options.cascadeChildren === false);
        state.singleSelect = !!(options && options.singleSelect);
        if (options && options.api) {
            config.api = options.api;
            state.authDeptList = []; // reset cache khi đổi API
        }

        if (!$('#' + config.containerId).length) {
            createContainer();
        }

        state.currentInput.attr('readonly', true).css({
            'background-color': '#fff',
            'cursor': 'pointer'
        });

        state.currentInput.off('click').on('click', function (e) {
            e.stopPropagation();
            toggleTree();
        });

        if (state.authDeptList.length === 0) {
            loadAuthorizedDepartments();
        } else {
            renderTree();
        }
    }

    function createContainer() {
        var html = `
            <div id="${config.containerId}" class="dept-tree-container d-none">
                <div class="p-2 border-bottom bg-light d-flex justify-content-between">
                    <span class="fw-bold">Chọn phòng ban</span>
                    <a href="javascript:void(0)" class="text-danger" id="close_dept_tree"><i class="bx bx-x"></i></a>
                </div>
                <div id="${config.treeId}" class="auth-dept-tree-scroll">
                    <div class="text-center p-3 text-muted">Đang tải...</div>
                </div>
            </div>
        `;
        $('body').append(html);

        $('#' + config.containerId).on('click', function (e) {
            e.stopPropagation();
        });

        $('#close_dept_tree').on('click', function () {
            $('#' + config.containerId).addClass('d-none');
        });

        $(document).on('click', function () {
            $('#' + config.containerId).addClass('d-none');
        });
    }

    function loadAuthorizedDepartments() {
        $.ajax({
            url: config.api,
            success: function (res) {
                state.authDeptList = res;
                renderTree();
            },
            error: function () {
                $('#' + config.treeId).html('<div class="p-3 text-danger">Lỗi khi tải danh sách phòng ban</div>');
            }
        });
    }

    function renderTree() {
        var treeArea = $('#' + config.treeId);
        if (!state.authDeptList || state.authDeptList.length === 0) {
            treeArea.html('<div class="p-2 text-muted">Không có phòng ban được phân quyền</div>');
            return;
        }

        var map = {};
        state.authDeptList.forEach(function (d) {
            map[d.id] = d;
            d.childrenAuth = [];
        });

        var roots = [];
        state.authDeptList.forEach(function (d) {
            if (d.parent && d.parent !== '0' && map[d.parent]) {
                map[d.parent].childrenAuth.push(d.id);
            } else {
                roots.push(d.id);
            }
        });

        var html = [];
        function buildHTML(id, level) {
            var itm = map[id];
            var pl = level * 15;
            html.push(`
                <div class="auth-tree-item" style="padding-left: ${pl}px">
                    <input type="checkbox" class="form-check-input auth-dept-chk-global" id="gchk_${itm.id}" data-id="${itm.id}" data-text="${itm.text}" data-parent="${itm.parent || ''}">
                    <label class="auth-tree-label" for="gchk_${itm.id}">${itm.text}</label>
                </div>
            `);
            itm.childrenAuth.forEach(function (cid) {
                buildHTML(cid, level + 1);
            });
        }

        roots.forEach(function (rid) {
            buildHTML(rid, 0);
        });

        treeArea.html(html.join(''));

        $('.auth-dept-chk-global').on('change', function () {
            var isChecked = $(this).is(':checked');
            var id = $(this).data('id');

            if (state.singleSelect && isChecked) {
                $('.auth-dept-chk-global').not(this).prop('checked', false);
            } else if (state.cascadeChildren) {
                checkChildren(id, isChecked);
            }

            updateSelection();
        });

        function checkChildren(pid, checked) {
            $('.auth-dept-chk-global[data-parent="' + pid + '"]').each(function () {
                $(this).prop('checked', checked);
                checkChildren($(this).data('id'), checked); // Recursive
            });
        }
    }

    function updateSelection() {
        var selectedTexts = [];
        state.selectedCodes = [];
        $('.auth-dept-chk-global:checked').each(function () {
            state.selectedCodes.push($(this).data('id'));
            selectedTexts.push($(this).data('text'));
        });

        var val = '';
        if (state.selectedCodes.length === 0) {
            val = '';
        } else if (state.singleSelect) {
            val = selectedTexts[0];
        } else if (state.selectedCodes.length === 1) {
            val = selectedTexts[0] + ' (' + state.selectedCodes[0] + ')';
        } else {
            val = 'Đã chọn ' + state.selectedCodes.length + ' phòng ban';
        }

        if (state.currentInput) {
            state.currentInput.val(val);
        }

        if (state.onSelectCallback) {
            state.onSelectCallback(state.selectedCodes);
        }
    }

    function toggleTree() {
        var container = $('#' + config.containerId);
        if (container.hasClass('d-none')) {
            var offset = state.currentInput.offset();
            var height = state.currentInput.outerHeight();
            container.css({
                top: (offset.top + height) + 'px',
                left: offset.left + 'px',
                width: Math.max(250, state.currentInput.outerWidth()) + 'px'
            }).removeClass('d-none');
        } else {
            container.addClass('d-none');
        }
    }

    // Mở tree cho một input cụ thể mà không cần gọi lại init()
    function openFor(inputSelector, callback) {
        state.currentInput = $(inputSelector);
        state.onSelectCallback = callback;
        if (state.singleSelect) {
            $('.auth-dept-chk-global').prop('checked', false);
        }
        var container = $('#' + config.containerId);
        var offset = state.currentInput.offset();
        var height = state.currentInput.outerHeight();
        container.css({
            top: (offset.top + height) + 'px',
            left: offset.left + 'px',
            width: Math.max(250, state.currentInput.outerWidth()) + 'px'
        }).removeClass('d-none');
    }

    return {
        init: init,
        getSelectedCodes: function () { return state.selectedCodes; },
        getAuthDeptList: function () { return state.authDeptList; },
        openFor: openFor
    };
})(jQuery);
