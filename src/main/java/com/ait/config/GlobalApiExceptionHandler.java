package com.ait.config;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class GlobalApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalApiExceptionHandler.class);

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Void> handleNoResourceFound(NoHandlerFoundException ex, HttpServletRequest request) {
        log.debug("Resource not found: {}", ex.getRequestURL());
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

        if (uri != null && uri.contains("/api/")) {
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }

        return "error/500";
    }

    private boolean isClientAbort(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
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
