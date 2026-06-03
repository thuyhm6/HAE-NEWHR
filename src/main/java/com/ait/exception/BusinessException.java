package com.ait.exception;

/**
 * BusinessException - Exception cho business logic errors
 */
public class BusinessException extends BaseException {

    public BusinessException(String errorCode, String userMessage) {
        super(errorCode, userMessage, userMessage);
    }

    public BusinessException(String errorCode, String userMessage, String technicalMessage) {
        super(errorCode, userMessage, technicalMessage);
    }

    public BusinessException(String errorCode, String userMessage, Throwable cause) {
        super(errorCode, userMessage, userMessage, cause);
    }

    public BusinessException(String errorCode, String userMessage, String technicalMessage, Throwable cause) {
        super(errorCode, userMessage, technicalMessage, cause);
    }

    // Common business exceptions
    public static BusinessException userNotFound(String username) {
        return new BusinessException("USER_NOT_FOUND",
                "Không tìm thấy người dùng: " + username,
                "User not found: " + username);
    }

    public static BusinessException invalidCredentials() {
        return new BusinessException("INVALID_CREDENTIALS",
                "Tên đăng nhập hoặc mật khẩu không đúng",
                "Invalid username or password");
    }

    public static BusinessException userInactive(String username) {
        return new BusinessException("USER_INACTIVE",
                "Tài khoản người dùng không hoạt động: " + username,
                "User account is inactive: " + username);
    }

    public static BusinessException employeeNotFound(String personId) {
        return new BusinessException("EMPLOYEE_NOT_FOUND",
                "Không tìm thấy thông tin nhân viên: " + personId,
                "Employee not found: " + personId);
    }

    public static BusinessException departmentNotFound(String deptNo) {
        return new BusinessException("DEPARTMENT_NOT_FOUND",
                "Không tìm thấy phòng ban: " + deptNo,
                "Department not found: " + deptNo);
    }

    public static BusinessException permissionDenied(String resource) {
        return new BusinessException("PERMISSION_DENIED",
                "Không có quyền truy cập: " + resource,
                "Permission denied for resource: " + resource);
    }

    public static BusinessException menuNotFound(String menuCode) {
        return new BusinessException("MENU_NOT_FOUND",
                "Không tìm thấy menu: " + menuCode,
                "Menu not found: " + menuCode);
    }

    public static BusinessException roleNotFound(String roleNo) {
        return new BusinessException("ROLE_NOT_FOUND",
                "Không tìm thấy vai trò: " + roleNo,
                "Role not found: " + roleNo);
    }

    public static BusinessException invalidInput(String field, String value) {
        return new BusinessException("INVALID_INPUT",
                "Dữ liệu đầu vào không hợp lệ: " + field + " = " + value,
                "Invalid input data: " + field + " = " + value);
    }

    public static BusinessException dataIntegrityViolation(String message) {
        return new BusinessException("DATA_INTEGRITY_VIOLATION",
                "Lỗi tính toàn vẹn dữ liệu: " + message,
                "Data integrity violation: " + message);
    }
}
