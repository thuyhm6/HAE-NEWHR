package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArItemParamDto;
import com.ait.ar.attendanceSettings.service.ArItemParamService;

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
public class ArItemParamController {
    private static final Logger log = LoggerFactory.getLogger(ArItemParamController.class);

    @Autowired
    private ArItemParamService arItemParamService;

    /**
     * Mở giao diện trang Danh sách tham số hạng mục
     */
    @GetMapping("/viewArItemParamList")
    public String viewArItemParamList() {
        return "ar/attendanceSettings/viewArItemParamList";
    }

    /**
     * Mở giao diện trang Quản lý tham số hạng mục (Tree-Table)
     */
    @GetMapping("/viewItemParameter")
    public String viewItemParameter() {
        return "ar/attendanceSettings/viewItemParameter";
    }

    /**
     * API: Lấy danh sách tham số hoặc tìm kiếm
     */
    @GetMapping("/api/arItemParam")
    @ResponseBody
    public ResponseEntity<List<ArItemParamDto>> getParams(
            @RequestParam(required = false) String itemNo) {
        List<ArItemParamDto> list = arItemParamService.getParamList(itemNo);
        return ResponseEntity.ok(list);
    }

    /**
     * API: Lấy thông tin bản ghi chi tiết theo ID
     */
    @GetMapping("/api/arItemParam/{arParamNo}")
    @ResponseBody
    public ResponseEntity<ArItemParamDto> getParamById(@PathVariable String arParamNo) {
        ArItemParamDto dto = arItemParamService.getParamById(arParamNo);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API: Lưu thông tin mới hoặc cập nhật bản ghi
     */
    @PostMapping("/api/arItemParam/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveParam(@RequestBody ArItemParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arItemParamService.saveParam(dto);
            response.put("success", true);
            response.put("message", "Lưu thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save AR item parameter paramNo={}", dto.getArParamNo(), e);
            response.put("error", "Loi he thong khi luu thong tin tham so hang muc.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API: Xóa bản ghi
     */
    @DeleteMapping("/api/arItemParam/delete/{arParamNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteParam(@PathVariable String arParamNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arItemParamService.deleteParam(arParamNo);
            response.put("success", true);
            response.put("message", "Xóa thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete AR item parameter paramNo={}", arParamNo, e);
            response.put("error", "Loi he thong khi xoa tham so hang muc.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/api/arItemParam/options")
    @ResponseBody
    public ResponseEntity<List<ArItemParamDto>> getArItemOptions(
            @RequestParam(name = "type", required = false, defaultValue = "attendance") String type) {
        return ResponseEntity.ok(arItemParamService.getArItemOptions(type));
    }
}
