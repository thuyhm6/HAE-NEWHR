package com.ait.config;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class GlobalApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalApiExceptionHandler.class);

    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public Object handleClientDisconnected(AsyncRequestNotUsableException ex, HttpServletRequest request) {
        String uri = request.getRequestURI();
        log.warn("Client disconnected before response completed uri={}", uri);
        return null;
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest request) {
        log.debug("Static resource not found: {}", ex.getResourcePath());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ExceptionHandler(Exception.class)
    public Object handleUnexpectedException(Exception ex, HttpServletRequest request) {
        String uri = request.getRequestURI();

        if (isClientAbort(ex)) {
            log.warn("Client aborted request uri={}", uri);
            return null;
        }

        log.error("Unhandled exception for uri={}", uri, ex);

        // Keep API responses sanitized even when a controller misses try/catch.
        if (uri != null && uri.contains("/api/")) {
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }

        return "error/500";
    }

    private boolean isClientAbort(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof AsyncRequestNotUsableException) {
                return true;
            }
            if (current instanceof IOException) {
                String message = current.getMessage();
                if (message != null) {
                    String lower = message.toLowerCase();
                    if (lower.contains("broken pipe")
                            || lower.contains("connection reset")
                            || lower.contains("connection was aborted")) {
                        return true;
                    }
                }
            }
            current = current.getCause();
        }
        return false;
    }
}
