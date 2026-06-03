package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArStaItemDto;
import com.ait.ar.attendanceSettings.service.ArStaItemService;
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
public class ArStaItemController {
    private static final Logger log = LoggerFactory.getLogger(ArStaItemController.class);

    @Autowired
    private ArStaItemService arStaItemService;

    @GetMapping("/viewSummaryItem")
    public String viewSummaryItem() {
        return "ar/attendanceSettings/viewSummaryItem";
    }

    @GetMapping("/api/arStaItem")
    @ResponseBody
    public ResponseEntity<List<ArStaItemDto>> getItems(@RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(arStaItemService.getItemList(searchText));
    }

    @GetMapping("/api/arStaItem/{itemNo}")
    @ResponseBody
    public ResponseEntity<ArStaItemDto> getItemById(@PathVariable String itemNo) {
        ArStaItemDto dto = arStaItemService.getItemById(itemNo);
        if (dto != null)
            return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/arStaItem/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveItem(@RequestBody ArStaItemDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            arStaItemService.saveItem(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save summary item itemNo={}", dto.getItemNo(), e);
            response.put("error", "Loi he thong khi luu thong tin chi tieu tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/arStaItem/delete/{itemNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable String itemNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            arStaItemService.deleteItem(itemNo);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete summary item itemNo={}", itemNo, e);
            response.put("error", "Loi he thong khi xoa chi tieu tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
