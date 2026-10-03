package com.ait.edu.trainEducation.util;

import com.ait.util.I18nUtil;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

/**
 * Kiểm tra dữ liệu import Excel của module đào tạo, gom lỗi theo dòng
 * (thông báo lấy từ messages*.properties theo ngôn ngữ hiện tại).
 */
public final class EduImportValidator {

    private EduImportValidator() {
    }

    public static boolean required(List<String> errors, String row, String value, String labelKey) {
        if (value == null || value.trim().isEmpty()) {
            errors.add(msg(row, "edu.import.msg.required", I18nUtil.getMessage(labelKey)));
            return false;
        }
        return true;
    }

    /** Ngày DD/MM/YYYY (cho phép rỗng). */
    public static boolean date(List<String> errors, String row, String value, String labelKey) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        SimpleDateFormat fmt = new SimpleDateFormat("dd/MM/yyyy");
        fmt.setLenient(false);
        try {
            fmt.parse(value);
            return true;
        } catch (ParseException e) {
            errors.add(msg(row, "edu.import.msg.invalidDate", I18nUtil.getMessage(labelKey)));
            return false;
        }
    }

    /** Giờ HH:mm (cho phép rỗng). */
    public static boolean time(List<String> errors, String row, String value, String labelKey) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        if (!value.matches("^([01]?\\d|2[0-3]):[0-5]\\d$")) {
            errors.add(msg(row, "edu.import.msg.invalidTime", I18nUtil.getMessage(labelKey)));
            return false;
        }
        return true;
    }

    /** Số (cho phép rỗng). */
    public static boolean number(List<String> errors, String row, String value, String labelKey) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        try {
            Double.parseDouble(value.replace(",", ""));
            return true;
        } catch (NumberFormatException e) {
            errors.add(msg(row, "edu.import.msg.invalidNumber", I18nUtil.getMessage(labelKey)));
            return false;
        }
    }

    /** Số trong khoảng [min, max] (cho phép rỗng). */
    public static boolean range(List<String> errors, String row, String value, String labelKey, double min, double max) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        try {
            double v = Double.parseDouble(value.replace(",", ""));
            if (v >= min && v <= max) {
                return true;
            }
        } catch (NumberFormatException e) {
            // rơi xuống báo lỗi bên dưới
        }
        errors.add(msg(row, "edu.import.msg.outOfRange", I18nUtil.getMessage(labelKey), formatNumber(min), formatNumber(max)));
        return false;
    }

    private static String formatNumber(double v) {
        return v == Math.floor(v) ? String.valueOf((long) v) : String.valueOf(v);
    }

    public static String msg(String row, String key, Object... args) {
        return I18nUtil.getMessage("edu.import.msg.row", new Object[] { row }) + " " + I18nUtil.getMessage(key, args);
    }

    /** Chuẩn hóa giờ "8:00" -> "08:00". */
    public static String normalizeTime(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return value.length() == 4 ? "0" + value : value;
    }

    /** Chuẩn hóa số: bỏ dấu phân cách hàng nghìn. */
    public static String normalizeNumber(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return value.replace(",", "");
    }
}
