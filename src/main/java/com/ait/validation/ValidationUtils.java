package com.ait.validation;

import com.ait.exception.ValidationException;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * ValidationUtils - Utility class cho input validation
 */
public class ValidationUtils {

    // Common regex patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^(\\+84|84|0)[0-9]{9,10}$");

    private static final Pattern USERNAME_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._-]{3,50}$");

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

    /**
     * Validate required field
     */
    public static void validateRequired(String fieldName, String value) throws ValidationException {
        if (!StringUtils.hasText(value)) {
            ValidationException ex = ValidationException.create("Trường " + fieldName + " là bắt buộc");
            ex.addValidationError(fieldName, "Trường này không được để trống");
            throw ex;
        }
    }

    /**
     * Validate required field with custom message
     */
    public static void validateRequired(String fieldName, String value, String customMessage)
            throws ValidationException {
        if (!StringUtils.hasText(value)) {
            ValidationException ex = ValidationException.create(customMessage);
            ex.addValidationError(fieldName, "Trường này không được để trống");
            throw ex;
        }
    }

    /**
     * Validate field length
     */
    public static void validateLength(String fieldName, String value, int minLength, int maxLength)
            throws ValidationException {
        if (value != null && (value.length() < minLength || value.length() > maxLength)) {
            ValidationException ex = ValidationException
                    .create("Trường " + fieldName + " phải có độ dài từ " + minLength + " đến " + maxLength + " ký tự");
            ex.addValidationError(fieldName, "Độ dài không hợp lệ");
            throw ex;
        }
    }

    /**
     * Validate email format
     */
    public static void validateEmail(String email) throws ValidationException {
        if (StringUtils.hasText(email) && !EMAIL_PATTERN.matcher(email).matches()) {
            ValidationException ex = ValidationException.create("Định dạng email không hợp lệ");
            ex.addValidationError("email", "Email phải có định dạng hợp lệ");
            throw ex;
        }
    }

    /**
     * Validate phone number format
     */
    public static void validatePhone(String phone) throws ValidationException {
        if (StringUtils.hasText(phone) && !PHONE_PATTERN.matcher(phone).matches()) {
            ValidationException ex = ValidationException.create("Định dạng số điện thoại không hợp lệ");
            ex.addValidationError("phone", "Số điện thoại phải có định dạng hợp lệ");
            throw ex;
        }
    }

    /**
     * Validate username format
     */
    public static void validateUsername(String username) throws ValidationException {
        if (StringUtils.hasText(username) && !USERNAME_PATTERN.matcher(username).matches()) {
            ValidationException ex = ValidationException
                    .create("Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang");
            ex.addValidationError("username", "Tên đăng nhập không hợp lệ");
            throw ex;
        }
    }

    /**
     * Validate password strength
     */
    public static void validatePassword(String password) throws ValidationException {
        if (StringUtils.hasText(password) && !PASSWORD_PATTERN.matcher(password).matches()) {
            ValidationException ex = ValidationException
                    .create("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
            ex.addValidationError("password", "Mật khẩu không đủ mạnh");
            throw ex;
        }
    }

    /**
     * Validate numeric range
     */
    public static void validateRange(String fieldName, Number value, Number min, Number max)
            throws ValidationException {
        if (value != null) {
            double val = value.doubleValue();
            double minVal = min.doubleValue();
            double maxVal = max.doubleValue();

            if (val < minVal || val > maxVal) {
                ValidationException ex = ValidationException
                        .create("Trường " + fieldName + " phải nằm trong khoảng từ " + min + " đến " + max);
                ex.addValidationError(fieldName, "Giá trị nằm ngoài phạm vi cho phép");
                throw ex;
            }
        }
    }

    /**
     * Validate positive number
     */
    public static void validatePositive(String fieldName, Number value) throws ValidationException {
        if (value != null && value.doubleValue() <= 0) {
            ValidationException ex = ValidationException.create("Trường " + fieldName + " phải là số dương");
            ex.addValidationError(fieldName, "Giá trị phải lớn hơn 0");
            throw ex;
        }
    }

    /**
     * Validate non-negative number
     */
    public static void validateNonNegative(String fieldName, Number value) throws ValidationException {
        if (value != null && value.doubleValue() < 0) {
            ValidationException ex = ValidationException.create("Trường " + fieldName + " không được âm");
            ex.addValidationError(fieldName, "Giá trị không được âm");
            throw ex;
        }
    }

    /**
     * Validate enum value
     */
    public static <T extends Enum<T>> void validateEnum(String fieldName, String value, Class<T> enumClass)
            throws ValidationException {
        if (StringUtils.hasText(value)) {
            try {
                Enum.valueOf(enumClass, value.toUpperCase());
            } catch (IllegalArgumentException e) {
                ValidationException ex = ValidationException
                        .create("Giá trị " + value + " không hợp lệ cho trường " + fieldName);
                ex.addValidationError(fieldName, "Giá trị không hợp lệ");
                throw ex;
            }
        }
    }

    /**
     * Validate date range
     */
    public static void validateDateRange(String fieldName, java.time.LocalDate startDate, java.time.LocalDate endDate)
            throws ValidationException {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            ValidationException ex = ValidationException.create("Ngày bắt đầu không được sau ngày kết thúc");
            ex.addValidationError(fieldName, "Khoảng thời gian không hợp lệ");
            throw ex;
        }
    }

    /**
     * Validate list not empty
     */
    public static void validateNotEmpty(String fieldName, List<?> list) throws ValidationException {
        if (list == null || list.isEmpty()) {
            ValidationException ex = ValidationException.create("Danh sách " + fieldName + " không được rỗng");
            ex.addValidationError(fieldName, "Danh sách không được rỗng");
            throw ex;
        }
    }

    /**
     * Validate object not null
     */
    public static void validateNotNull(String fieldName, Object value) throws ValidationException {
        if (value == null) {
            ValidationException ex = ValidationException.create("Trường " + fieldName + " không được null");
            ex.addValidationError(fieldName, "Trường này không được null");
            throw ex;
        }
    }

    /**
     * Validate multiple fields at once
     */
    public static void validateMultiple(ValidationRule... rules) throws ValidationException {
        List<ValidationException.ValidationError> errors = new ArrayList<>();

        for (ValidationRule rule : rules) {
            try {
                rule.validate();
            } catch (ValidationException e) {
                errors.addAll(e.getValidationErrors());
            }
        }

        if (!errors.isEmpty()) {
            throw ValidationException.create("Dữ liệu đầu vào không hợp lệ", errors);
        }
    }

    /**
     * ValidationRule interface for custom validation
     */
    @FunctionalInterface
    public interface ValidationRule {
        void validate() throws ValidationException;
    }
}
