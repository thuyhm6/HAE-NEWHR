package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHaeDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHae;
import com.ait.ar.attendanceMintenance.service.ArScheduleHaeService;
import com.ait.util.AngularIndexService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArScheduleHaeController {
    private static final Logger log = LoggerFactory.getLogger(ArScheduleHaeController.class);

    @Autowired
    private ArScheduleHaeService service;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/addEmpShiftView")
    public String addEmpShiftView(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/scheduleHae/list")
    public ResponseEntity<List<ArScheduleHaeDto>> getList(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String month) {

        Map<String, Object> params = new HashMap<>();
        params.put("empId", empId);

        // Mặc định hiển thị theo tháng hiện tại nếu không truyền lên
        if (month == null || month.isEmpty()) {
            month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        params.put("month", month);

        return ResponseEntity.ok(service.getList(params));
    }

    @GetMapping("/api/scheduleHae/{pkNo}")
    public ResponseEntity<ArScheduleHaeDto> getById(@PathVariable Long pkNo) {
        return ResponseEntity.ok(service.getByPkNo(pkNo));
    }

    @PostMapping("/api/scheduleHae/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody ArScheduleHae model) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.save(model);
            response.put("success", true);
            response.put("message", "Lưu thành công");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save schedule HAE pkNo={}", model.getPkNo(), e);
            response.put("error", "Loi he thong khi luu xep ca nhan vien.");
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/scheduleHae/delete/{pkNo}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long pkNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.delete(pkNo);
            response.put("success", true);
            response.put("message", "Xóa thành công");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete schedule HAE pkNo={}", pkNo, e);
            response.put("error", "Loi he thong khi xoa xep ca nhan vien.");
        }
        return ResponseEntity.ok(response);
    }
}
