package com.ait.sy.sys.controller;

import com.ait.util.I18nUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.support.RequestContextUtils;

@Controller
public class LanguageController {

    @GetMapping("/change-language")
    public String changeLanguage(
            @RequestParam String lang,
            HttpServletRequest request,
            HttpServletResponse response) {

        if (!I18nUtil.isLanguageSupported(lang)) {
            lang = "vi";
        }

        Locale locale = I18nUtil.createLocale(lang);
        LocaleResolver localeResolver = RequestContextUtils.getLocaleResolver(request);
        if (localeResolver != null) {
            localeResolver.setLocale(request, response, locale);
        }

        // Đồng bộ session attribute "language" để LanguageParameterInterceptor đọc được
        request.getSession(true).setAttribute("language", lang);

        return "redirect:" + resolveSafeRedirectTarget(request);
    }

    @GetMapping("/api/current-language")
    @org.springframework.web.bind.annotation.ResponseBody
    public Map<String, Object> getCurrentLanguage(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();

        Locale currentLocale = I18nUtil.getCurrentLocale();
        String currentLanguageCode = I18nUtil.getCurrentLanguageCode();
        String currentLanguageName = I18nUtil.getCurrentLanguageName();

        result.put("locale", currentLocale.toString());
        result.put("languageCode", currentLanguageCode);
        result.put("languageName", currentLanguageName);
        result.put("supportedLanguages", I18nUtil.getSupportedLanguages());

        Map<String, String> supportedLanguagesMap = new HashMap<>();
        for (String langCode : I18nUtil.getSupportedLanguages()) {
            supportedLanguagesMap.put(langCode, I18nUtil.getLanguageName(langCode));
        }
        result.put("supportedLanguagesMap", supportedLanguagesMap);

        return result;
    }

    @GetMapping("/api/supported-languages")
    @org.springframework.web.bind.annotation.ResponseBody
    public Map<String, String> getSupportedLanguages() {
        Map<String, String> supportedLanguages = new HashMap<>();

        for (String langCode : I18nUtil.getSupportedLanguages()) {
            supportedLanguages.put(langCode, I18nUtil.getLanguageName(langCode));
        }

        return supportedLanguages;
    }

    private String resolveSafeRedirectTarget(HttpServletRequest request) {
        String referer = request.getHeader("Referer");
        if (referer == null || referer.isBlank()) {
            return "/";
        }

        try {
            URI refererUri = URI.create(referer);
            String refererHost = refererUri.getHost();
            String requestHost = request.getServerName();

            if (refererHost == null || !refererHost.equalsIgnoreCase(requestHost)) {
                return "/";
            }

            String path = refererUri.getRawPath();
            if (path == null || path.isBlank() || !path.startsWith("/")) {
                return "/";
            }

            String query = refererUri.getRawQuery();
            return (query == null || query.isBlank()) ? path : path + "?" + query;
        } catch (IllegalArgumentException ex) {
            return "/";
        }
    }
}
