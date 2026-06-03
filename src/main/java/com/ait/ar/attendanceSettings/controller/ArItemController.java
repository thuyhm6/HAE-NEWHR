package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArItemDto;
import com.ait.ar.attendanceSettings.service.ArItemService;

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
public class ArItemController {
    private static final Logger log = LoggerFactory.getLogger(ArItemController.class);

    @Autowired
    private ArItemService arItemService;

    /**
     * Mở giao diện trang Danh sách hạng mục
     */
    @GetMapping("/viewArItem")
    public String viewArItem() {
        return "ar/attendanceSettings/viewArItem";
    }

    /**
     * API: Lấy danh sách hạng mục hoặc tìm kiếm
     */
    @GetMapping("/api/arItem")
    @ResponseBody
    public ResponseEntity<List<ArItemDto>> getItems(
            @RequestParam(required = false) String itemNo) {
        List<ArItemDto> list = arItemService.getItemList(itemNo);
        return ResponseEntity.ok(list);
    }

    /**
     * API: Lấy thông tin bản ghi chi tiết theo ID
     */
    @GetMapping("/api/arItem/{itemNo}")
    @ResponseBody
    public ResponseEntity<ArItemDto> getItemById(@PathVariable String itemNo) {
        ArItemDto dto = arItemService.getItemById(itemNo);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API: Lưu thông tin mới hoặc cập nhật bản ghi
     */
    @PostMapping("/api/arItem/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveItem(@RequestBody ArItemDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arItemService.saveItem(dto);
            response.put("success", true);
            response.put("message", "Lưu thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save AR item itemNo={}", dto.getItemNo(), e);
            response.put("error", "Loi he thong khi luu thong tin hang muc.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * API: Xóa bản ghi
     */
    @DeleteMapping("/api/arItem/delete/{itemNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable String itemNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arItemService.deleteItem(itemNo);
            response.put("success", true);
            response.put("message", "Xóa thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete AR item itemNo={}", itemNo, e);
            response.put("error", "Loi he thong khi xoa thong tin hang muc.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
