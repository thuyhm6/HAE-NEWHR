package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.model.ArStatisticDateParam;
import com.ait.ar.attendanceSettings.service.ArStatisticDateParamService;

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
public class ArStatisticDateParamController {
    private static final Logger log = LoggerFactory.getLogger(ArStatisticDateParamController.class);

    @Autowired
    private ArStatisticDateParamService cycleParamService;

    /**
     * Mở giao diện trang thông số chu kỳ chấm công
     */
    @GetMapping("/viewCycleParameter")
    public String viewCycleParameter() {
        return "ar/attendanceSettings/viewCycleParameter";
    }

    /**
     * API: Lấy toàn bộ danh sách hoặc tìm kiếm
     */
    @GetMapping("/api/cycleParameter")
    @ResponseBody
    public ResponseEntity<List<ArStatisticDateParam>> getCycleParams(
            @RequestParam(required = false) String cpnyId,
            @RequestParam(required = false) String statNo) {
        List<ArStatisticDateParam> list = cycleParamService.getCycleParams(cpnyId, statNo);
        return ResponseEntity.ok(list);
    }

    /**
     * API: Lấy thông tin bản ghi chi tiết theo ID
     */
    @GetMapping("/api/cycleParameter/{paramNo}")
    @ResponseBody
    public ResponseEntity<ArStatisticDateParam> getCycleParamById(@PathVariable String paramNo) {
        ArStatisticDateParam param = cycleParamService.getCycleParamById(paramNo);
        if (param != null) {
            return ResponseEntity.ok(param);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API: Lưu thông tin mới hoặc cập nhật bản ghi đã tồn tại
     */
    @PostMapping("/api/cycleParameter/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveCycleParam(@RequestBody ArStatisticDateParam param) {
        Map<String, Object> response = new HashMap<>();
        try {
            cycleParamService.saveCycleParam(param);
            response.put("success", true);
            response.put("message", "Lưu thông số chu kỳ thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save cycle parameter paramNo={}", param.getParamNo(), e);
            response.put("error", "Loi he thong khi luu thong so chu ky cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API: Xóa bản ghi
     */
    @DeleteMapping("/api/cycleParameter/delete/{paramNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCycleParam(@PathVariable String paramNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            cycleParamService.deleteCycleParam(paramNo);
            response.put("success", true);
            response.put("message", "Xóa thông số chu kỳ thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete cycle parameter paramNo={}", paramNo, e);
            response.put("error", "Loi he thong khi xoa thong so chu ky cham cong.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
