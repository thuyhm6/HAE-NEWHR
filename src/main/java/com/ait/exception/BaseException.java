package com.ait.exception;

/**
 * BaseException - Base exception class cho tất cả custom exceptions
 */
public abstract class BaseException extends Exception {

    private final String errorCode;
    private final String userMessage;
    private final String technicalMessage;

    protected BaseException(String errorCode, String userMessage, String technicalMessage) {
        super(technicalMessage);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
        this.technicalMessage = technicalMessage;
    }

    protected BaseException(String errorCode, String userMessage, String technicalMessage, Throwable cause) {
        super(technicalMessage, cause);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
        this.technicalMessage = technicalMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getTechnicalMessage() {
        return technicalMessage;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s - %s", errorCode, userMessage, technicalMessage);
    }
}
