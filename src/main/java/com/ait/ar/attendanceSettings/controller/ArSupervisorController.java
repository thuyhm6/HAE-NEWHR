package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArSupervisorDto;
import com.ait.ar.attendanceSettings.model.ArSupervisor;
import com.ait.ar.attendanceSettings.service.ArSupervisorService;
import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import com.ait.hrm.empinfo.model.HrEmployee;
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
public class ArSupervisorController {
    private static final Logger log = LoggerFactory.getLogger(ArSupervisorController.class);

    @Autowired
    private ArSupervisorService service;

    @Autowired
    private HrEmployeeMapper empMapper;

    @GetMapping("/viewAttendanceKeeper")
    public String viewAttendanceKeeper() {
        return "ar/attendanceSettings/viewAttendanceKeeper";
    }

    // 1. Lấy danh sách Supervisor (Left Pane)
    @GetMapping("/api/arSupervisor")
    @ResponseBody
    public ResponseEntity<List<ArSupervisorDto>> getAllSupervisors() {
        return ResponseEntity.ok(service.getAllSupervisors());
    }

    // 2. Lookup chi tiết nhân viên (cần thiết khi Thêm mới)
    @GetMapping("/api/arSupervisor/lookupEmp/{personId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> lookupEmployee(@PathVariable String personId) {
        Map<String, Object> response = new HashMap<>();
        HrEmployee emp = empMapper.findByPersonId(personId);
        if (emp != null) {
            response.put("success", true);
            response.put("data", emp);
            return ResponseEntity.ok(response);
        }
        response.put("success", false);
        response.put("error", "Không tìm thấy nhân viên với ID này");
        return ResponseEntity.ok(response);
    }

    // 3. Lấy thông tin 1 Supervisor
    @GetMapping("/api/arSupervisor/{personId}")
    @ResponseBody
    public ResponseEntity<ArSupervisor> getSupervisor(@PathVariable String personId) {
        ArSupervisor model = service.getSupervisorByPersonId(personId);
        if (model != null) {
            return ResponseEntity.ok(model);
        }
        return ResponseEntity.notFound().build();
    }

    // 4. Cấu trúc cây Department (Right Pane)
    @GetMapping("/api/arSupervisor/departments")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getDepartmentTree() {
        return ResponseEntity.ok(service.getDepartmentTree());
    }

    // 5. Lấy danh sách quyền phòng ban của Supervisor
    @GetMapping("/api/arSupervisor/{personId}/departments")
    @ResponseBody
    public ResponseEntity<List<String>> getSupervisorDepartments(@PathVariable String personId) {
        return ResponseEntity.ok(service.getDeptListByPersonId(personId));
    }

    // 6. Lưu Thông tin Supervisor
    @PostMapping("/api/arSupervisor/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSupervisor(@RequestBody ArSupervisor model) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveSupervisor(model);
            response.put("success", true);
            response.put("message", "Lưu thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save supervisor personId={}", model.getPersonId(), e);
            response.put("error", "Loi he thong khi luu thong tin nguoi cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // 7. Xóa Supervisor
    @DeleteMapping("/api/arSupervisor/delete/{personId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteSupervisor(@PathVariable String personId) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteSupervisor(personId);
            response.put("success", true);
            response.put("message", "Xóa nhân viên phân quyền thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete supervisor personId={}", personId, e);
            response.put("error", "Loi he thong khi xoa nguoi cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // 8. Lưu Cấu hình Phòng Ban cho Person_ID
    @PostMapping("/api/arSupervisor/{personId}/saveDepartments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSupervisorDepartments(
            @PathVariable String personId,
            @RequestBody List<String> deptNoList) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveSupervisorInfo(personId, deptNoList);
            response.put("success", true);
            response.put("message", "Cập nhật phân quyền phòng ban thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save supervisor departments personId={}", personId, e);
            response.put("error", "Loi he thong khi cap nhat phong ban duoc phan quyen.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/api/arSupervisor/authorized-departments")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getAuthorizedDepartments() {
        return ResponseEntity.ok(service.getAuthorizedDepartments());
    }

}
