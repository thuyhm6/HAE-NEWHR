package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArStaItemParamDto;
import com.ait.ar.attendanceSettings.service.ArStaItemParamService;
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
public class ArStaItemParamController {
    private static final Logger log = LoggerFactory.getLogger(ArStaItemParamController.class);

    @Autowired
    private ArStaItemParamService service;

    @GetMapping("/viewSummaryParamItem")
    public String viewSummaryParamItem() {
        return "ar/attendanceSettings/viewSummaryParamItem";
    }

    @GetMapping("/api/arStaItemParam")
    @ResponseBody
    public ResponseEntity<List<ArStaItemParamDto>> getItems(
            @RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(service.getItemList(searchText));
    }

    @GetMapping("/api/arStaItemParam/availableItems")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getAvailableItems() {
        return ResponseEntity.ok(service.getAvailableItems());
    }

    @GetMapping("/api/arStaItemParam/{paramNo}")
    @ResponseBody
    public ResponseEntity<ArStaItemParamDto> getItemById(@PathVariable String paramNo) {
        ArStaItemParamDto dto = service.getItemById(paramNo);
        if (dto != null)
            return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/arStaItemParam/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveItem(@RequestBody ArStaItemParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveItem(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save summary param item paramNo={}", dto.getParamNo(), e);
            response.put("error", "Loi he thong khi luu tham so chi tieu tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/arStaItemParam/delete/{paramNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable String paramNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteItem(paramNo);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete summary param item paramNo={}", paramNo, e);
            response.put("error", "Loi he thong khi xoa tham so chi tieu tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
