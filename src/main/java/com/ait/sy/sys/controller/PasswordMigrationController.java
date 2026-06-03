package com.ait.sy.sys.controller;

import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PasswordMigrationService;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/password-migration")
public class PasswordMigrationController {

    private static final Logger log = LoggerFactory.getLogger(PasswordMigrationController.class);

    @Autowired
    private PasswordMigrationService passwordMigrationService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMigrationStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null) {
            return authError;
        }

        try {
            boolean isCompleted = passwordMigrationService.isMigrationCompleted();
            int usersNeedingMigration = passwordMigrationService.getUsersNeedingMigration();

            response.put("migrationCompleted", isCompleted);
            response.put("usersNeedingMigration", usersNeedingMigration);
            response.put("status", isCompleted ? "COMPLETED" : "PENDING");
            response.put("message", isCompleted
                    ? "Password migration da hoan thanh"
                    : "Con " + usersNeedingMigration + " users can migration");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get password migration status", e);
            response.put("error", "System error while checking migration status");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/migrate-all")
    public ResponseEntity<Map<String, Object>> migrateAllPasswords(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null) {
            return authError;
        }

        try {
            if (passwordMigrationService.isMigrationCompleted()) {
                response.put("message", "Password migration was already completed");
                response.put("status", "ALREADY_COMPLETED");
                return ResponseEntity.ok(response);
            }

            passwordMigrationService.migrateAllPasswords();

            boolean isCompleted = passwordMigrationService.isMigrationCompleted();
            int remainingUsers = passwordMigrationService.getUsersNeedingMigration();

            response.put("message", "Password migration completed");
            response.put("status", isCompleted ? "SUCCESS" : "PARTIAL_SUCCESS");
            response.put("migrationCompleted", isCompleted);
            response.put("remainingUsers", remainingUsers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to migrate all passwords", e);
            response.put("error", "System error while migrating all passwords");
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/migrate-user/{userNo}")
    public ResponseEntity<Map<String, Object>> migrateUserPassword(
            @PathVariable String userNo,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null) {
            return authError;
        }

        try {
            boolean success = passwordMigrationService.migrateUserPassword(userNo);
            response.put("message", success
                    ? "Password migration successful for user: " + userNo
                    : "Password migration failed for user: " + userNo);
            response.put("status", success ? "SUCCESS" : "FAILED");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to migrate password for user {}", userNo, e);
            response.put("error", "System error while migrating password for user");
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check-user/{userNo}")
    public ResponseEntity<Map<String, Object>> checkUserPassword(@PathVariable String userNo, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null) {
            return authError;
        }

        try {
            boolean needsMigration = !passwordMigrationService.isMigrationCompleted();
            response.put("userNo", userNo);
            response.put("needsMigration", needsMigration);
            response.put("message", needsMigration ? "User needs migration" : "User already migrated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to check migration status for user {}", userNo, e);
            response.put("error", "System error while checking user migration status");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> checkAdminAccess(HttpSession session) {
        if (session == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null || user.getSyUser() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String userType = user.getSyUser().getUserType();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userType) || "SYS".equalsIgnoreCase(userType);
        if (!isAdmin) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        return null;
    }
}
