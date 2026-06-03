package com.ait.exception;

/**
 * TechnicalException - Exception cho technical errors
 */
public class TechnicalException extends BaseException {

    public TechnicalException(String errorCode, String userMessage) {
        super(errorCode, userMessage, userMessage);
    }

    public TechnicalException(String errorCode, String userMessage, String technicalMessage) {
        super(errorCode, userMessage, technicalMessage);
    }

    public TechnicalException(String errorCode, String userMessage, Throwable cause) {
        super(errorCode, userMessage, userMessage, cause);
    }

    public TechnicalException(String errorCode, String userMessage, String technicalMessage, Throwable cause) {
        super(errorCode, userMessage, technicalMessage, cause);
    }

    // Common technical exceptions
    public static TechnicalException databaseConnectionError(Throwable cause) {
        return new TechnicalException("DATABASE_CONNECTION_ERROR",
                "Lỗi kết nối cơ sở dữ liệu",
                "Database connection error", cause);
    }

    public static TechnicalException databaseQueryError(String query, Throwable cause) {
        return new TechnicalException("DATABASE_QUERY_ERROR",
                "Lỗi thực thi truy vấn cơ sở dữ liệu",
                "Database query error: " + query, cause);
    }

    public static TechnicalException fileOperationError(String operation, Throwable cause) {
        return new TechnicalException("FILE_OPERATION_ERROR",
                "Lỗi thao tác file: " + operation,
                "File operation error: " + operation, cause);
    }

    public static TechnicalException networkError(String operation, Throwable cause) {
        return new TechnicalException("NETWORK_ERROR",
                "Lỗi kết nối mạng: " + operation,
                "Network error: " + operation, cause);
    }

    public static TechnicalException configurationError(String config, Throwable cause) {
        return new TechnicalException("CONFIGURATION_ERROR",
                "Lỗi cấu hình: " + config,
                "Configuration error: " + config, cause);
    }

    public static TechnicalException externalServiceError(String service, Throwable cause) {
        return new TechnicalException("EXTERNAL_SERVICE_ERROR",
                "Lỗi dịch vụ bên ngoài: " + service,
                "External service error: " + service, cause);
    }

    public static TechnicalException cacheError(String operation, Throwable cause) {
        return new TechnicalException("CACHE_ERROR",
                "Lỗi cache: " + operation,
                "Cache error: " + operation, cause);
    }

    public static TechnicalException encryptionError(String operation, Throwable cause) {
        return new TechnicalException("ENCRYPTION_ERROR",
                "Lỗi mã hóa: " + operation,
                "Encryption error: " + operation, cause);
    }

    public static TechnicalException sessionError(String operation, Throwable cause) {
        return new TechnicalException("SESSION_ERROR",
                "Lỗi session: " + operation,
                "Session error: " + operation, cause);
    }

    public static TechnicalException rateLimitError(String operation) {
        return new TechnicalException("RATE_LIMIT_ERROR",
                "Vượt quá giới hạn tần suất: " + operation,
                "Rate limit exceeded: " + operation);
    }
}
