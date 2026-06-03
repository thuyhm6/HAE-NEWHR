package com.ait.sy.sys.service.impl;

import org.springframework.stereotype.Service;

import com.ait.sy.sys.service.RateLimitingService;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * RateLimitingServiceImpl - Implementation của RateLimitingService
 * Sử dụng in-memory storage cho rate limiting
 */
@Service
public class RateLimitingServiceImpl implements RateLimitingService {

    // Rate limit configurations
    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final int LOGIN_WINDOW_SECONDS = 15 * 60; // 15 phút
    private static final int API_MAX_ATTEMPTS = 100;
    private static final int API_WINDOW_SECONDS = 60; // 1 phút

    // In-memory storage cho rate limiting
    private final ConcurrentHashMap<String, RateLimitEntry> rateLimitStore = new ConcurrentHashMap<>();

    @Override
    public boolean isAllowed(String identifier, String operation) {
        String key = identifier + ":" + operation;
        RateLimitEntry entry = rateLimitStore.get(key);

        if (entry == null) {
            // Tạo entry mới
            entry = new RateLimitEntry(getMaxAttempts(operation), getWindowSeconds(operation));
            rateLimitStore.put(key, entry);
            return true;
        }

        // Kiểm tra xem window đã hết hạn chưa
        if (entry.isWindowExpired()) {
            entry.reset();
            return true;
        }

        // Kiểm tra số lần còn lại
        return entry.getCurrentAttempts() < entry.getMaxAttempts();
    }

    @Override
    public void recordRequest(String identifier, String operation) {
        String key = identifier + ":" + operation;
        RateLimitEntry entry = rateLimitStore.get(key);

        if (entry == null) {
            entry = new RateLimitEntry(getMaxAttempts(operation), getWindowSeconds(operation));
            rateLimitStore.put(key, entry);
        } else if (entry.isWindowExpired()) {
            entry.reset();
        }

        entry.incrementAttempts();
    }

    @Override
    public void resetRateLimit(String identifier, String operation) {
        String key = identifier + ":" + operation;
        RateLimitEntry entry = rateLimitStore.get(key);
        if (entry != null) {
            entry.reset();
        }
    }

    @Override
    public int getRemainingAttempts(String identifier, String operation) {
        String key = identifier + ":" + operation;
        RateLimitEntry entry = rateLimitStore.get(key);

        if (entry == null) {
            return getMaxAttempts(operation);
        }

        if (entry.isWindowExpired()) {
            return getMaxAttempts(operation);
        }

        return Math.max(0, entry.getMaxAttempts() - entry.getCurrentAttempts());
    }

    @Override
    public long getTimeUntilReset(String identifier, String operation) {
        String key = identifier + ":" + operation;
        RateLimitEntry entry = rateLimitStore.get(key);

        if (entry == null) {
            return 0;
        }

        if (entry.isWindowExpired()) {
            return 0;
        }

        return entry.getTimeUntilReset();
    }

    /**
     * Lấy max attempts cho operation
     */
    private int getMaxAttempts(String operation) {
        switch (operation.toLowerCase()) {
            case "login":
                return LOGIN_MAX_ATTEMPTS;
            case "api":
                return API_MAX_ATTEMPTS;
            default:
                return 10; // Default
        }
    }

    /**
     * Lấy window time cho operation
     */
    private int getWindowSeconds(String operation) {
        switch (operation.toLowerCase()) {
            case "login":
                return LOGIN_WINDOW_SECONDS;
            case "api":
                return API_WINDOW_SECONDS;
            default:
                return 60; // Default 1 phút
        }
    }

    /**
     * Inner class để lưu trữ rate limit information
     */
    private static class RateLimitEntry {
        private final int maxAttempts;
        private final int windowSeconds;
        private final AtomicInteger currentAttempts;
        private long windowStartTime;

        public RateLimitEntry(int maxAttempts, int windowSeconds) {
            this.maxAttempts = maxAttempts;
            this.windowSeconds = windowSeconds;
            this.currentAttempts = new AtomicInteger(0);
            this.windowStartTime = System.currentTimeMillis();
        }

        public boolean isWindowExpired() {
            return System.currentTimeMillis() - windowStartTime > (windowSeconds * 1000L);
        }

        public void reset() {
            this.currentAttempts.set(0);
            this.windowStartTime = System.currentTimeMillis();
        }

        public void incrementAttempts() {
            this.currentAttempts.incrementAndGet();
        }

        public int getCurrentAttempts() {
            return currentAttempts.get();
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public long getTimeUntilReset() {
            long elapsed = System.currentTimeMillis() - windowStartTime;
            long remaining = (windowSeconds * 1000L) - elapsed;
            return Math.max(0, remaining / 1000); // Convert to seconds
        }
    }
}
