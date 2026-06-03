package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArShift010Dto;
import com.ait.ar.attendanceSettings.dto.ArShift020Dto;
import com.ait.ar.attendanceSettings.service.ArShiftService;
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
public class ArShiftController {
    private static final Logger log = LoggerFactory.getLogger(ArShiftController.class);

    @Autowired
    private ArShiftService arShiftService;

    // View HTML page
    @GetMapping("/viewShift")
    public String viewShift() {
        return "ar/attendanceSettings/viewShift";
    }

    // --- API FOR SHIFT 010 (Parent) ---

    @GetMapping("/api/shift")
    @ResponseBody
    public ResponseEntity<List<ArShift010Dto>> getShifts(
            @RequestParam(required = false) String cpnyId,
            @RequestParam(required = false) String searchText) {
        List<ArShift010Dto> list = arShiftService.getShiftList(cpnyId, searchText);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/shift/{shiftNo}")
    @ResponseBody
    public ResponseEntity<ArShift010Dto> getShiftById(@PathVariable String shiftNo) {
        ArShift010Dto dto = arShiftService.getShiftById(shiftNo);
        if (dto != null)
            return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/shift/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveShift(@RequestBody ArShift010Dto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arShiftService.saveShift(dto);
            response.put("success", true);
            response.put("message", "Lưu thông tin ca làm việc thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save shift shiftNo={}", dto.getShiftNo(), e);
            response.put("error", "Loi he thong khi luu ca lam viec.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/shift/delete/{shiftNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteShift(@PathVariable String shiftNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arShiftService.deleteShift(shiftNo);
            response.put("success", true);
            response.put("message", "Xóa ca làm việc thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete shift shiftNo={}", shiftNo, e);
            response.put("error", "Loi he thong khi xoa ca lam viec.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // --- API FOR SHIFT 020 (Children) ---

    @GetMapping("/api/shiftDetail")
    @ResponseBody
    public ResponseEntity<List<ArShift020Dto>> getShiftDetails(@RequestParam String shiftNo) {
        List<ArShift020Dto> list = arShiftService.getShiftDetailList(shiftNo);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/shiftDetail/{pkNo}")
    @ResponseBody
    public ResponseEntity<ArShift020Dto> getShiftDetailById(@PathVariable Long pkNo) {
        ArShift020Dto dto = arShiftService.getShiftDetailById(pkNo);
        if (dto != null)
            return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/shiftDetail/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveShiftDetail(@RequestBody ArShift020Dto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arShiftService.saveShiftDetail(dto);
            response.put("success", true);
            response.put("message", "Lưu tham số thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save shift detail pkNo={}", dto.getPkNo(), e);
            response.put("error", "Loi he thong khi luu tham so ca lam viec.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/shiftDetail/delete/{pkNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteShiftDetail(@PathVariable Long pkNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arShiftService.deleteShiftDetail(pkNo);
            response.put("success", true);
            response.put("message", "Xóa tham số thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete shift detail pkNo={}", pkNo, e);
            response.put("error", "Loi he thong khi xoa tham so ca lam viec.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
