package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArEmpGroupDto;
import com.ait.ar.attendanceSettings.model.ArEmpGroup;
import com.ait.ar.attendanceSettings.service.ArEmpGroupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceSettings")
public class ArEmpGroupController {
    private static final Logger log = LoggerFactory.getLogger(ArEmpGroupController.class);

    @Autowired
    private ArEmpGroupService service;

    @GetMapping("/viewDynamicGroup")
    public String viewDynamicGroup() {
        return "ar/attendanceSettings/viewDynamicGroup";
    }

    @GetMapping("/api/dynamicGroup/list")
    public ResponseEntity<List<ArEmpGroupDto>> getList(
            @RequestParam(required = false) String empId) {
        Map<String, Object> params = new HashMap<>();
        params.put("empId", empId);
        return ResponseEntity.ok(service.getList(params));
    }

    @GetMapping("/api/dynamicGroup/{personId}")
    public ResponseEntity<ArEmpGroupDto> getById(@PathVariable String personId) {
        return ResponseEntity.ok(service.getByPersonId(personId, "80000084"));
    }

    @PostMapping("/api/dynamicGroup/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody ArEmpGroup model) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.save(model);
            response.put("success", true);
            response.put("message", "Lưu thành công");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save dynamic group personId={}", model.getPersonId(), e);
            response.put("error", "Loi he thong khi luu nhom dong.");
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/dynamicGroup/delete/{personId}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String personId) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.delete(personId, "80000084");
            response.put("success", true);
            response.put("message", "Xóa thành công");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete dynamic group personId={}", personId, e);
            response.put("error", "Loi he thong khi xoa nhom dong.");
        }
        return ResponseEntity.ok(response);
    }
}
