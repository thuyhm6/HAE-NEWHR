package com.ait.sy.sys.service;

/**
 * RateLimitingService - Interface cho rate limiting
 */
public interface RateLimitingService {

    /**
     * Kiểm tra xem có thể thực hiện request không
     * 
     * @param identifier Định danh (IP address, username, etc.)
     * @param operation  Loại operation (login, api_call, etc.)
     * @return true nếu được phép, false nếu bị limit
     */
    boolean isAllowed(String identifier, String operation);

    /**
     * Ghi nhận một request
     * 
     * @param identifier Định danh
     * @param operation  Loại operation
     */
    void recordRequest(String identifier, String operation);

    /**
     * Reset rate limit cho một identifier
     * 
     * @param identifier Định danh
     * @param operation  Loại operation
     */
    void resetRateLimit(String identifier, String operation);

    /**
     * Lấy số lần còn lại trong window hiện tại
     * 
     * @param identifier Định danh
     * @param operation  Loại operation
     * @return Số lần còn lại
     */
    int getRemainingAttempts(String identifier, String operation);

    /**
     * Lấy thời gian còn lại cho đến khi reset
     * 
     * @param identifier Định danh
     * @param operation  Loại operation
     * @return Thời gian còn lại (seconds)
     */
    long getTimeUntilReset(String identifier, String operation);
}
