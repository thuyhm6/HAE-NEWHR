package com.ait.config;

import com.ait.util.I18nUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.springframework.web.servlet.support.RequestContextUtils;

import java.util.Locale;

/**
 * Cấu hình đa ngôn ngữ cho Spring Boot
 */
@Configuration
public class MultilingualConfig implements WebMvcConfigurer {

    /**
     * Cấu hình MessageSource để load các file messages.properties
     */
    @Bean
    public ResourceBundleMessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600); // Cache for 1 hour
        messageSource.setFallbackToSystemLocale(false);
        return messageSource;
    }

    /**
     * Cấu hình LocaleResolver sử dụng Session
     */
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver sessionLocaleResolver = new SessionLocaleResolver();
        // Ngôn ngữ mặc định là tiếng Việt
        sessionLocaleResolver.setDefaultLocale(new Locale("vi", "VN"));
        return sessionLocaleResolver;
    }

    /**
     * Custom interceptor thay thế LocaleChangeInterceptor mặc định.
     * LocaleChangeInterceptor gốc dùng StringUtils.parseLocaleString("vi") → Locale("vi")
     * (không có country code), dẫn đến Spring không tìm được messages_vi_VN.properties
     * mà fallback về messages.properties (tiếng Anh).
     * Interceptor này dùng I18nUtil.createLocale() để tạo đúng Locale("vi","VN").
     */
    @Bean
    @org.springframework.lang.NonNull
    public HandlerInterceptor localeChangeInterceptor() {
        return new HandlerInterceptor() {
            @Override
            public boolean preHandle(@org.springframework.lang.NonNull HttpServletRequest request,
                                     @org.springframework.lang.NonNull HttpServletResponse response,
                                     @org.springframework.lang.NonNull Object handler) throws Exception {
                String lang = request.getParameter("lang");
                if (lang != null && !lang.trim().isEmpty() && I18nUtil.isLanguageSupported(lang.trim())) {
                    Locale locale = I18nUtil.createLocale(lang.trim());
                    LocaleResolver localeResolver = RequestContextUtils.getLocaleResolver(request);
                    if (localeResolver != null) {
                        localeResolver.setLocale(request, response, locale);
                    }
                    // Đồng bộ session attribute cho LanguageParameterInterceptor
                    request.getSession(true).setAttribute("language", lang.trim());
                }
                return true;
            }
        };
    }

    /**
     * Đăng ký interceptor
     */
    @Override
    public void addInterceptors(@org.springframework.lang.NonNull InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

    /**
     * Lấy danh sách ngôn ngữ được hỗ trợ
     */
    public static String[] getSupportedLanguages() {
        return new String[] { "vi", "en", "zh", "ko" };
    }

    /**
     * Lấy tên ngôn ngữ theo mã
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
     * Lấy mã ngôn ngữ theo tên
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
}
