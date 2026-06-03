package com.ait.util;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Utility class để sử dụng đa ngôn ngữ (i18n) trong ứng dụng
 */
@Component
public class I18nUtil {

    private static MessageSource messageSource;

    public I18nUtil(MessageSource messageSource) {
        I18nUtil.messageSource = messageSource;
    }

    /**
     * Lấy message theo key với locale hiện tại
     *
     * @param key Key của message
     * @return Message đã được dịch
     */
    public static String getMessage(String key) {
        return getMessage(key, null, LocaleContextHolder.getLocale());
    }

    /**
     * Lấy message theo key với locale hiện tại và arguments
     *
     * @param key  Key của message
     * @param args Arguments để thay thế vào message
     * @return Message đã được dịch
     */
    public static String getMessage(String key, Object[] args) {
        return getMessage(key, args, LocaleContextHolder.getLocale());
    }

    /**
     * Lấy message theo key với locale cụ thể
     *
     * @param key    Key của message
     * @param args   Arguments để thay thế vào message
     * @param locale Locale cụ thể
     * @return Message đã được dịch
     */
    public static String getMessage(String key, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            // Trả về key nếu không tìm thấy message
            return key;
        }
    }

    /**
     * Lấy message với locale cụ thể (không có arguments)
     *
     * @param key    Key của message
     * @param locale Locale cụ thể
     * @return Message đã được dịch
     */
    public static String getMessage(String key, Locale locale) {
        return getMessage(key, null, locale);
    }

    /**
     * Kiểm tra xem message key có tồn tại không
     *
     * @param key Key của message
     * @return true nếu message tồn tại
     */
    public static boolean hasMessage(String key) {
        try {
            String message = messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
            return message != null && !message.equals(key);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy locale hiện tại
     *
     * @return Locale hiện tại
     */
    public static Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }

    /**
     * Lấy mã ngôn ngữ hiện tại (vi, en, zh, ko)
     *
     * @return Mã ngôn ngữ hiện tại
     */
    public static String getCurrentLanguageCode() {
        Locale locale = getCurrentLocale();
        return locale.getLanguage();
    }

    /**
     * Lấy tên ngôn ngữ hiện tại
     *
     * @return Tên ngôn ngữ hiện tại
     */
    public static String getCurrentLanguageName() {
        String languageCode = getCurrentLanguageCode();
        switch (languageCode) {
            case "vi":
                return "Tiếng Việt";
            case "en":
                return "English";
            case "zh":
                return "中文";
            case "ko":
                return "한국어";
            default:
                return "Unknown";
        }
    }

    /**
     * Lấy danh sách các ngôn ngữ được hỗ trợ
     *
     * @return Mảng các mã ngôn ngữ được hỗ trợ
     */
    public static String[] getSupportedLanguages() {
        return new String[] { "vi", "en", "zh", "ko" };
    }

    /**
     * Kiểm tra xem ngôn ngữ có được hỗ trợ không
     *
     * @param languageCode Mã ngôn ngữ
     * @return true nếu ngôn ngữ được hỗ trợ
     */
    public static boolean isLanguageSupported(String languageCode) {
        String[] supportedLanguages = getSupportedLanguages();
        for (String supported : supportedLanguages) {
            if (supported.equals(languageCode)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Lấy tên ngôn ngữ theo mã ngôn ngữ
     *
     * @param languageCode Mã ngôn ngữ
     * @return Tên ngôn ngữ
     */
    public static String getLanguageName(String languageCode) {
        switch (languageCode) {
            case "vi":
                return "Tiếng Việt";
            case "en":
                return "English";
            case "zh":
                return "中文";
            case "ko":
                return "한국어";
            default:
                return "Unknown";
        }
    }

    /**
     * Lấy mã ngôn ngữ theo tên ngôn ngữ
     *
     * @param languageName Tên ngôn ngữ
     * @return Mã ngôn ngữ
     */
    public static String getLanguageCode(String languageName) {
        switch (languageName) {
            case "Tiếng Việt":
                return "vi";
            case "English":
                return "en";
            case "中文":
                return "zh";
            case "한국어":
                return "ko";
            default:
                return "vi";
        }
    }

    /**
     * Tạo Locale từ mã ngôn ngữ
     *
     * @param languageCode Mã ngôn ngữ
     * @return Locale object
     */
    public static Locale createLocale(String languageCode) {
        switch (languageCode) {
            case "vi":
                return new Locale("vi", "VN");
            case "en":
                return new Locale("en", "US");
            case "zh":
                return new Locale("zh", "CN");
            case "ko":
                return new Locale("ko", "KR");
            default:
                return new Locale("vi", "VN");
        }
    }
}

