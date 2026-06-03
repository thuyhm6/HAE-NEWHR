package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArDepartmentManageDto;
import com.ait.ar.attendanceSettings.model.ArDepartmentManage;
import com.ait.ar.attendanceSettings.service.ArDepartmentManageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceSettings")
public class ArDepartmentManageController {
    private static final Logger log = LoggerFactory.getLogger(ArDepartmentManageController.class);

    @Autowired
    private ArDepartmentManageService service;

    @GetMapping("/viewDepartManagerList")
    public String viewContent() {
        return "ar/attendanceSettings/viewDepartManagerList";
    }

    @GetMapping("/api/departmentManage/list")
    @ResponseBody
    public ResponseEntity<List<ArDepartmentManageDto>> getList(
            @RequestParam(required = false) String lockDate,
            @RequestParam(required = false) String deptNo,
            HttpServletRequest request) {
        return ResponseEntity.ok(service.getDepartmentManageList(lockDate, deptNo, request));
    }

    @PostMapping("/api/departmentManage/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(
            @RequestBody List<ArDepartmentManage> locks,
            HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            service.saveDepartmentManage(locks, request);
            result.put("success", true);
            result.put("message", "Lưu chốt công thành công.");
        } catch (Exception e) {
            log.error("Failed to save department attendance lock info", e);
            result.put("success", false);
            result.put("error", "Loi he thong khi luu chot cong phong ban.");
        }
        return ResponseEntity.ok(result);
    }
}
