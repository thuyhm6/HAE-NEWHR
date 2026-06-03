(function (window, $, moment) {
    'use strict';

    if (!window || !$ || !moment) {
        return;
    }

    // Supported attributes:
    // data-drp-format, data-drp-single, data-drp-time, data-drp-24h,
    // data-drp-time-increment, data-drp-auto-apply, data-drp-auto-update-input,
    // data-drp-show-dropdowns, data-drp-trigger-change, data-drp-opens,
    // data-drp-drops, data-drp-normalize, data-drp-on-apply, data-drp-on-init,
    // data-drp-apply-label, data-drp-cancel-label
    // data-drp-skip="true" de bo qua auto-init cho input[type="date"] / datetime-local

    function readAttr($input, name, defaultValue) {
        var raw = $input.attr('data-' + name);
        if (raw === undefined || raw === null || raw === '') {
            return defaultValue;
        }
        return raw;
    }

    function readBoolAttr($input, name, defaultValue) {
        var raw = readAttr($input, name, null);
        if (raw === null) {
            return defaultValue;
        }
        if (typeof raw === 'boolean') {
            return raw;
        }
        return String(raw).toLowerCase() === 'true';
    }

    function readIntAttr($input, name, defaultValue) {
        var raw = readAttr($input, name, null);
        if (raw === null) {
            return defaultValue;
        }
        var parsed = parseInt(raw, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    function resolveHandler(handlerName) {
        if (!handlerName || typeof handlerName !== 'string') {
            return null;
        }

        var scope = window;
        var parts = handlerName.split('.');
        for (var i = 0; i < parts.length; i++) {
            scope = scope ? scope[parts[i]] : null;
        }

        return typeof scope === 'function' ? scope : null;
    }

    function ensureDateInputCompatibility($input) {
        var currentType = String($input.attr('type') || '').toLowerCase();
        var originalType = String($input.data('drpOriginalType') || currentType).toLowerCase();

        if (!$input.data('drpOriginalType') && currentType) {
            $input.data('drpOriginalType', currentType);
        }

        if ((originalType === 'date' || originalType === 'datetime-local') && currentType !== 'text') {
            $input.attr('type', 'text');
        }

        if ((originalType === 'date' || originalType === 'datetime-local') && !$input.hasClass('js-daterangepicker')) {
            $input.addClass('js-daterangepicker');
        }

        if (!$input.attr('data-drp-format')) {
            if (originalType === 'datetime-local') {
                $input.attr('data-drp-format', 'YYYY-MM-DD HH:mm');
                $input.attr('data-drp-time', 'true');
                $input.attr('data-drp-24h', 'true');
            } else if (originalType === 'date') {
                $input.attr('data-drp-format', 'YYYY-MM-DD');
            }
        }
    }

    function getOriginalInputType($input) {
        return String($input.data('drpOriginalType') || $input.attr('type') || '').toLowerCase();
    }

    function buildConfig($input) {
        return {
            format: readAttr($input, 'drp-format', 'YYYY-MM-DD'),
            singleDatePicker: readBoolAttr($input, 'drp-single', true),
            timePicker: readBoolAttr($input, 'drp-time', false),
            timePicker24Hour: readBoolAttr($input, 'drp-24h', true),
            timePickerIncrement: readIntAttr($input, 'drp-time-increment', 1),
            autoApply: readBoolAttr($input, 'drp-auto-apply', true),
            autoUpdateInput: readBoolAttr($input, 'drp-auto-update-input', true),
            showDropdowns: readBoolAttr($input, 'drp-show-dropdowns', true),
            triggerChange: readBoolAttr($input, 'drp-trigger-change', false),
            opens: readAttr($input, 'drp-opens', 'right'),
            drops: readAttr($input, 'drp-drops', 'down'),
            applyLabel: readAttr($input, 'drp-apply-label', 'Apply'),
            cancelLabel: readAttr($input, 'drp-cancel-label', 'Cancel'),
            normalizeHandler: resolveHandler(readAttr($input, 'drp-normalize', '')),
            onApplyHandler: resolveHandler(readAttr($input, 'drp-on-apply', '')),
            onInitHandler: resolveHandler(readAttr($input, 'drp-on-init', ''))
        };
    }

    function normalizeValue($input, config) {
        var currentValue = ($input.val() || '').trim();
        var originalType = getOriginalInputType($input);

        if (originalType === 'datetime-local' && currentValue) {
            currentValue = currentValue.replace('T', ' ');
            $input.val(currentValue);
        }

        if (!config.normalizeHandler) {
            return currentValue;
        }

        var normalized = config.normalizeHandler($input[0], currentValue, $input, config);
        if (typeof normalized === 'string') {
            currentValue = normalized;
            $input.val(normalized);
        }

        return currentValue;
    }

    function syncPickerValue($input, config) {
        var currentValue = normalizeValue($input, config);
        if (!currentValue) {
            return;
        }

        var picker = $input.data('daterangepicker');
        if (!picker) {
            return;
        }

        var parsedDate = moment(currentValue, config.format, true);
        if (!parsedDate.isValid()) {
            return;
        }

        picker.setStartDate(parsedDate);
        if (config.singleDatePicker) {
            picker.setEndDate(parsedDate);
        }
    }

    function bindPickerEvents($input, config) {
        $input.off('.sharedDrp');
        $input.on('apply.daterangepicker.sharedDrp', function (ev, picker) {
            $input.val(picker.startDate.format(config.format));

            if (config.onApplyHandler) {
                config.onApplyHandler(this, picker, $input, config);
            }

            if (config.triggerChange) {
                $input.trigger('change');
            }
        });
        $input.on('cancel.daterangepicker.sharedDrp', function () {
            $input.val('');

            if (config.triggerChange) {
                $input.trigger('change');
            }
        });
    }

    function initPicker($input, options) {
        if (!$input || !$input.length) {
            return;
        }

        ensureDateInputCompatibility($input);

        var config = buildConfig($input);
        var forceReinit = !!(options && options.forceReinit);

        if ($input.data('drpInitialized') && !forceReinit) {
            syncPickerValue($input, config);
            return;
        }

        if ($input.data('daterangepicker')) {
            $input.data('daterangepicker').remove();
        }

        $input.daterangepicker({
            singleDatePicker: config.singleDatePicker,
            timePicker: config.timePicker,
            timePicker24Hour: config.timePicker24Hour,
            timePickerIncrement: config.timePickerIncrement,
            autoApply: config.autoApply,
            autoUpdateInput: config.autoUpdateInput,
            showDropdowns: config.showDropdowns,
            opens: config.opens,
            drops: config.drops,
            locale: {
                format: config.format,
                applyLabel: config.applyLabel,
                cancelLabel: config.cancelLabel
            }
        });

        $input.data('drpInitialized', true);
        bindPickerEvents($input, config);
        syncPickerValue($input, config);

        if (config.onInitHandler) {
            config.onInitHandler($input[0], $input.data('daterangepicker'), $input, config);
        }
    }

    window.initDateRangePickers = function (context, options) {
        if (!$.fn || !$.fn.daterangepicker) {
            return;
        }

        var $context = $(context || document);
        var selector = 'input.js-daterangepicker, input[type="date"]:not([data-drp-skip="true"]), input[type="datetime-local"]:not([data-drp-skip="true"])';
        var $inputs = $context.is(selector)
            ? $context
            : $context.find(selector);

        $inputs.each(function () {
            initPicker($(this), options);
        });
    };

    window.refreshDateRangePicker = function (target) {
        initPicker($(target), { forceReinit: true });
    };
})(window, window.jQuery, window.moment);
