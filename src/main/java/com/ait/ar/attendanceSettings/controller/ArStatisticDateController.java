package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArStatisticDateDto;
import com.ait.ar.attendanceSettings.service.ArStatisticDateService;

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
public class ArStatisticDateController {
    private static final Logger log = LoggerFactory.getLogger(ArStatisticDateController.class);

    @Autowired
    private ArStatisticDateService arStatisticDateService;

    /**
     * Mở giao diện trang chi nhánh (chu kỳ chấm công)
     */
    @GetMapping("/viewCycle")
    public String viewCycle() {
        return "ar/attendanceSettings/viewCycle";
    }

    /**
     * API: Lấy danh sách chu kỳ hoặc tìm kiếm
     */
    @GetMapping("/api/cycle")
    @ResponseBody
    public ResponseEntity<List<ArStatisticDateDto>> getCycles(
            @RequestParam(required = false) String statNo) {
        List<ArStatisticDateDto> list = arStatisticDateService.getCycleList(statNo);
        return ResponseEntity.ok(list);
    }

    /**
     * API: Lấy thông tin bản ghi chi tiết theo ID
     */
    @GetMapping("/api/cycle/{statNo}")
    @ResponseBody
    public ResponseEntity<ArStatisticDateDto> getCycleById(@PathVariable String statNo) {
        ArStatisticDateDto dto = arStatisticDateService.getCycleById(statNo);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API: Lưu thông tin mới hoặc cập nhật bản ghi
     */
    @PostMapping("/api/cycle/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveCycle(@RequestBody ArStatisticDateDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arStatisticDateService.saveCycle(dto);
            response.put("success", true);
            response.put("message", "Lưu thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save statistic cycle statNo={}", dto.getStatNo(), e);
            response.put("error", "Loi he thong khi luu chu ky cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API: Xóa bản ghi
     */
    @DeleteMapping("/api/cycle/delete/{statNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCycle(@PathVariable String statNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arStatisticDateService.deleteCycle(statNo);
            response.put("success", true);
            response.put("message", "Xóa thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete statistic cycle statNo={}", statNo, e);
            response.put("error", "Loi he thong khi xoa chu ky cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
