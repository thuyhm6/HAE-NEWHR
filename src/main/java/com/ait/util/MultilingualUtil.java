package com.ait.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.ait.sy.sys.service.MultilingualService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

/**
 * Utility class hỗ trợ đa ngôn ngữ
 */
@Component
public class MultilingualUtil {

    @Autowired
    private MultilingualService multilingualService;

    /**
     * Lấy ngôn ngữ hiện tại từ request
     */
    public String getCurrentLanguage() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String lang = request.getParameter("lang");
            if (lang != null && multilingualService.isLanguageSupported(lang)) {
                return lang;
            }

            // Lấy từ session
            Object sessionLang = request.getSession().getAttribute("language");
            if (sessionLang != null && multilingualService.isLanguageSupported(sessionLang.toString())) {
                return sessionLang.toString();
            }
        }

        // Fallback về ngôn ngữ mặc định
        return multilingualService.getDefaultLanguage();
    }

    /**
     * Lấy nội dung đa ngôn ngữ với ngôn ngữ hiện tại
     */
    public String getText(String no) {
        String currentLanguage = getCurrentLanguage();
        return multilingualService.getContentWithFallback(no, currentLanguage,
                multilingualService.getDefaultLanguage());
    }

    /**
     * Lấy nội dung đa ngôn ngữ với ngôn ngữ chỉ định
     */
    public String getText(String no, String language) {
        return multilingualService.getContentWithFallback(no, language, multilingualService.getDefaultLanguage());
    }

    /**
     * Lấy tất cả nội dung đa ngôn ngữ theo mã số
     */
    public Map<String, String> getTexts(String no) {
        return multilingualService.getContentsByNo(no);
    }

    /**
     * Lấy nội dung đa ngôn ngữ với fallback
     */
    public String getTextWithFallback(String no, String language, String fallbackLanguage) {
        return multilingualService.getContentWithFallback(no, language, fallbackLanguage);
    }

    /**
     * Kiểm tra ngôn ngữ có được hỗ trợ không
     */
    public boolean isLanguageSupported(String language) {
        return multilingualService.isLanguageSupported(language);
    }

    /**
     * Lấy danh sách ngôn ngữ có sẵn
     */
    public String[] getAvailableLanguages() {
        return multilingualService.getAvailableLanguages().toArray(new String[0]);
    }

    /**
     * Lấy tên ngôn ngữ theo mã
     */
    public String getLanguageName(String languageCode) {
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
     * Lấy mã ngôn ngữ theo tên
     */
    public String getLanguageCode(String languageName) {
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
     * Lấy Locale từ mã ngôn ngữ
     */
    public Locale getLocale(String languageCode) {
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

    /**
     * Lấy mã ngôn ngữ từ Locale
     */
    public String getLanguageCode(Locale locale) {
        if (locale == null) {
            return multilingualService.getDefaultLanguage();
        }

        String language = locale.getLanguage();
        switch (language) {
            case "vi":
                return "vi";
            case "en":
                return "en";
            case "zh":
                return "zh";
            case "ko":
                return "ko";
            default:
                return multilingualService.getDefaultLanguage();
        }
    }
}
