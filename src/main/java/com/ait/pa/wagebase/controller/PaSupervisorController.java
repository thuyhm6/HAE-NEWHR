package com.ait.pa.wagebase.controller;

import com.ait.pa.wagebase.dto.PaSupervisorDto;
import com.ait.pa.wagebase.service.PaSupervisorService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/pa/wagebase")
public class PaSupervisorController {

    private static final Logger log = LoggerFactory.getLogger(PaSupervisorController.class);

    @Autowired
    private PaSupervisorService paSupervisorService;

    @GetMapping("/viewPaSupervisor")
    public String viewPaSupervisor() {
        return "pa/wagebase/viewPaSupervisor";
    }

    // ── Danh sách phân trang (DataTables) ─────────────────────────────────
    @GetMapping("/api/supervisor/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String empSearch,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empOfficeSearch,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaSupervisorDto params = new PaSupervisorDto();
            params.setEmpSearch(empSearch);
            params.setDeptNos(deptNos);
            params.setEmpOfficeSearch(empOfficeSearch);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaSupervisorDto> result = paSupervisorService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách người phụ trách lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    // ── Danh sách tất cả supervisor đang hoạt động (left pane) ────────────
    @GetMapping("/api/supervisor/all")
    @ResponseBody
    public ResponseEntity<?> getAllSupervisorList() {
        try {
            return ResponseEntity.ok(paSupervisorService.getAllSupervisorList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách người phụ trách lương (all): {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Phòng ban được phân quyền PA (dùng cho DeptTree component) ──────────
    @GetMapping("/api/supervisor/authorized-departments")
    @ResponseBody
    public ResponseEntity<?> getAuthorizedDepartments() {
        try {
            return ResponseEntity.ok(paSupervisorService.getAuthorizedDepartments());
        } catch (Exception e) {
            log.error("Lỗi khi lấy phòng ban được phân quyền PA: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Cây phòng ban từ HR_DEPARTMENT ────────────────────────────────────
    @GetMapping("/api/supervisor/departments")
    @ResponseBody
    public ResponseEntity<?> getDepartmentTree() {
        try {
            return ResponseEntity.ok(paSupervisorService.getDepartmentTree());
        } catch (Exception e) {
            log.error("Lỗi khi lấy cây phòng ban: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Danh sách DEPTNO đã phân quyền cho PERSON_ID ──────────────────────
    @GetMapping("/api/supervisor/{personId}/departments")
    @ResponseBody
    public ResponseEntity<?> getDeptList(@PathVariable String personId) {
        try {
            return ResponseEntity.ok(paSupervisorService.getDeptNoListByPersonId(personId));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách phòng ban personId={}: {}", personId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Lưu phân quyền phòng ban ───────────────────────────────────────────
    @PostMapping("/api/supervisor/{personId}/saveDepartments")
    @ResponseBody
    public ResponseEntity<?> saveDepartments(
            @PathVariable String personId,
            @RequestBody List<String> deptNoList) {
        try {
            paSupervisorService.saveSupervisorDepts(personId, deptNoList);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật phân quyền phòng ban thành công!"));
        } catch (Exception e) {
            log.error("Lỗi khi lưu phân quyền phòng ban personId={}: {}", personId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Chi tiết một bản ghi ───────────────────────────────────────────────
    @GetMapping("/api/supervisor/{personId}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable String personId) {
        try {
            PaSupervisorDto dto = paSupervisorService.getOne(personId);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết personId={}: {}", personId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Lưu (thêm mới / cập nhật) ─────────────────────────────────────────
    @PostMapping("/api/supervisor/save")
    @ResponseBody
    public ResponseEntity<?> save(@RequestBody PaSupervisorDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn người phụ trách!"));
            }
            paSupervisorService.save(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Lưu thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi lưu người phụ trách lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Xóa một supervisor kèm toàn bộ PA_SUPERVISOR_INFO ─────────────────
    @DeleteMapping("/api/supervisor/delete/{personId}")
    @ResponseBody
    public ResponseEntity<?> deleteSupervisor(@PathVariable String personId) {
        try {
            paSupervisorService.deleteSupervisorWithInfo(personId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa người phụ trách thành công!"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa người phụ trách lương personId={}: {}", personId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Xóa nhiều bản ghi ─────────────────────────────────────────────────
    @DeleteMapping("/api/supervisor/deleteList")
    @ResponseBody
    public ResponseEntity<?> deleteList(@RequestBody List<String> personIds) {
        try {
            if (personIds == null || personIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn ít nhất một bản ghi!"));
            }
            paSupervisorService.deleteList(personIds);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + personIds.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách người phụ trách lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
