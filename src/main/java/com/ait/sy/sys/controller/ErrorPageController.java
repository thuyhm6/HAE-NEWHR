package com.ait.sy.sys.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

/**
 * ErrorPageController - Xu ly cac trang loi duoc khai bao trong web.xml (error-page).
 * Neu khong co Controller map cac duong dan nay, container se forward toi handler
 * khong ton tai va roi ve mac dinh /error cua Spring Boot, gay chuoi loi 404 chong 404.
 */
@Controller
public class ErrorPageController {

    private static final Logger log = LoggerFactory.getLogger(ErrorPageController.class);

    @GetMapping("/error/403")
    public String forbidden(HttpServletRequest request) {
        logOriginalRequest(request);
        return "error/403";
    }

    @GetMapping("/error/404")
    public String notFound(HttpServletRequest request) {
        logOriginalRequest(request);
        return "error/404";
    }

    @GetMapping("/error/500")
    public String internalServerError(HttpServletRequest request) {
        logOriginalRequest(request);
        return "error/500";
    }

    @GetMapping("/error/general")
    public String general(HttpServletRequest request) {
        logOriginalRequest(request);
        return "error/500";
    }

    private void logOriginalRequest(HttpServletRequest request) {
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        log.warn("Error page rendered for original request uri={} statusCode={}", uri, statusCode);
    }
}
