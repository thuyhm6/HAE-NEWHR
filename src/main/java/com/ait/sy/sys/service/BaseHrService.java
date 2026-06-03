package com.ait.sy.sys.service;

import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Base service class for common HR operations.
 */
@Service
public abstract class BaseHrService {

    private static final Logger log = LoggerFactory.getLogger(BaseHrService.class);

    public boolean isUserAuthenticated(HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        return currentHrUser != null;
    }

    public HrUserInfo getCurrentUser(HttpSession session) {
        return (HrUserInfo) session.getAttribute("currentHrUser");
    }

    public String getClientIpAddress(HttpSession session) {
        return "127.0.0.1";
    }

    public void setCreateAuditFields(Object entity, HrUserInfo user, String clientIp) {
        try {
            if (entity.getClass().getMethod("setCreateDate", LocalDateTime.class) != null) {
                entity.getClass().getMethod("setCreateDate", LocalDateTime.class).invoke(entity, LocalDateTime.now());
            }
            if (entity.getClass().getMethod("setCreatedBy", String.class) != null) {
                entity.getClass().getMethod("setCreatedBy", String.class).invoke(entity, user.getUsername());
            }
            if (entity.getClass().getMethod("setCreatedIp", String.class) != null) {
                entity.getClass().getMethod("setCreatedIp", String.class).invoke(entity, clientIp);
            }
            if (entity.getClass().getMethod("setUpdateDate", LocalDateTime.class) != null) {
                entity.getClass().getMethod("setUpdateDate", LocalDateTime.class).invoke(entity, LocalDateTime.now());
            }
            if (entity.getClass().getMethod("setUpdatedBy", String.class) != null) {
                entity.getClass().getMethod("setUpdatedBy", String.class).invoke(entity, user.getUsername());
            }
            if (entity.getClass().getMethod("setUpdatedIp", String.class) != null) {
                entity.getClass().getMethod("setUpdatedIp", String.class).invoke(entity, clientIp);
            }
        } catch (Exception e) {
            log.error("Failed to set create audit fields", e);
        }
    }

    public void setUpdateAuditFields(Object entity, HrUserInfo user, String clientIp) {
        try {
            if (entity.getClass().getMethod("setUpdateDate", LocalDateTime.class) != null) {
                entity.getClass().getMethod("setUpdateDate", LocalDateTime.class).invoke(entity, LocalDateTime.now());
            }
            if (entity.getClass().getMethod("setUpdatedBy", String.class) != null) {
                entity.getClass().getMethod("setUpdatedBy", String.class).invoke(entity, user.getUsername());
            }
            if (entity.getClass().getMethod("setUpdatedIp", String.class) != null) {
                entity.getClass().getMethod("setUpdatedIp", String.class).invoke(entity, clientIp);
            }
        } catch (Exception e) {
            log.error("Failed to set update audit fields", e);
        }
    }

    public <T> DataTablesResponse<T> createErrorResponse(DataTablesRequest request, String errorMessage) {
        DataTablesResponse<T> errorResponse = new DataTablesResponse<>();
        errorResponse.setDraw(request.getDraw());
        errorResponse.setError(errorMessage);
        return errorResponse;
    }

    public <T> DataTablesResponse<T> createSuccessResponse(
            DataTablesRequest request,
            java.util.List<T> data,
            int totalRecords,
            int filteredRecords) {
        DataTablesResponse<T> response = new DataTablesResponse<>();
        response.setDraw(request.getDraw());
        response.setRecordsTotal(totalRecords);
        response.setRecordsFiltered(filteredRecords);
        response.setData(data);
        return response;
    }

    public Map<String, String> createErrorResponse(String errorMessage) {
        return Map.of("error", errorMessage);
    }

    public Map<String, Object> createSuccessResponse(String message, Object data) {
        return Map.of("message", message, "data", data);
    }

    public Map<String, String> createSuccessResponse(String message) {
        return Map.of("message", message);
    }

    public String validateRequiredFields(Map<String, Object> fields) {
        for (Map.Entry<String, Object> entry : fields.entrySet()) {
            if (entry.getValue() == null
                    || (entry.getValue() instanceof String && ((String) entry.getValue()).trim().isEmpty())) {
                return "Truong " + entry.getKey() + " khong duoc de trong";
            }
        }
        return null;
    }

    public String generateUniqueId(String prefix) {
        return prefix + System.currentTimeMillis();
    }

    public void logOperation(String operation, String details) {
        log.info("Operation={} details={} timestamp={}", operation, details, LocalDateTime.now());
    }

    public String handleException(Exception e, String operation) {
        log.error("Error in operation={}", operation, e);
        return "Loi he thong khi thuc hien thao tac.";
    }
}
