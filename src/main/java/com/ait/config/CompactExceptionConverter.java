package com.ait.config;

import ch.qos.logback.classic.pattern.ThrowableProxyConverter;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.StackTraceElementProxy;

/**
 * Chỉ hiển thị exception message + frame đầu tiên thuộc com.ait.*
 * Bỏ qua toàn bộ org.*, java.*, sun.*, oracle.* trong stacktrace
 */
public class CompactExceptionConverter extends ThrowableProxyConverter {

    private static final String[] SKIP_PREFIXES = {
        "org.", "java.", "javax.", "sun.", "com.sun.",
        "ch.qos.", "net.sf.", "com.zaxxer.", "oracle.", "jdk."
    };

    @Override
    protected String throwableProxyToString(IThrowableProxy tp) {
        if (tp == null) return "";
        StringBuilder sb = new StringBuilder();
        renderChain(tp, sb, "");
        return sb.toString();
    }

    private void renderChain(IThrowableProxy tp, StringBuilder sb, String prefix) {
        if (tp == null) return;
        if (tp.getCause() != null) {
            renderChain(tp.getCause(), sb, "Caused by: ");
        }
        sb.append(prefix).append(tp.getClassName());
        if (tp.getMessage() != null) {
            sb.append(": ").append(tp.getMessage());
        }
        sb.append(System.lineSeparator());
        String frame = findFirstAppFrame(tp);
        if (frame != null) {
            sb.append("\tat ").append(frame).append(System.lineSeparator());
        }
    }

    private String findFirstAppFrame(IThrowableProxy tp) {
        StackTraceElementProxy[] frames = tp.getStackTraceElementProxyArray();
        if (frames == null || frames.length == 0) return null;
        for (StackTraceElementProxy frame : frames) {
            String str = frame.getSTEAsString();
            if (!shouldSkip(str)) return str;
        }
        return frames[0].getSTEAsString();
    }

    private boolean shouldSkip(String frame) {
        for (String prefix : SKIP_PREFIXES) {
            if (frame.startsWith(prefix)) return true;
        }
        return false;
    }
}
