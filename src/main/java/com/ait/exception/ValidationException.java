package com.ait.exception;

import java.util.ArrayList;
import java.util.List;

/**
 * ValidationException - Exception cho validation errors
 */
public class ValidationException extends BaseException {

    private final List<ValidationError> validationErrors;

    public ValidationException(String errorCode, String userMessage) {
        super(errorCode, userMessage, userMessage);
        this.validationErrors = new ArrayList<>();
    }

    public ValidationException(String errorCode, String userMessage, String technicalMessage) {
        super(errorCode, userMessage, technicalMessage);
        this.validationErrors = new ArrayList<>();
    }

    public ValidationException(String errorCode, String userMessage, List<ValidationError> validationErrors) {
        super(errorCode, userMessage, userMessage);
        this.validationErrors = validationErrors != null ? validationErrors : new ArrayList<>();
    }

    public ValidationException(String errorCode, String userMessage, String technicalMessage,
            List<ValidationError> validationErrors) {
        super(errorCode, userMessage, technicalMessage);
        this.validationErrors = validationErrors != null ? validationErrors : new ArrayList<>();
    }

    public List<ValidationError> getValidationErrors() {
        return validationErrors;
    }

    public void addValidationError(String field, String message) {
        this.validationErrors.add(new ValidationError(field, message));
    }

    public void addValidationError(ValidationError error) {
        this.validationErrors.add(error);
    }

    public boolean hasValidationErrors() {
        return !validationErrors.isEmpty();
    }

    public static ValidationException create(String message) {
        return new ValidationException("VALIDATION_ERROR", message);
    }

    public static ValidationException create(String message, List<ValidationError> errors) {
        return new ValidationException("VALIDATION_ERROR", message, errors);
    }

    /**
     * ValidationError - Represents a single validation error
     */
    public static class ValidationError {
        private final String field;
        private final String message;

        public ValidationError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public String getMessage() {
            return message;
        }

        @Override
        public String toString() {
            return String.format("%s: %s", field, message);
        }
    }
}
