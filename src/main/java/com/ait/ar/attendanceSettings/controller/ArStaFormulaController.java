package com.ait.ar.attendanceSettings.controller;

import com.ait.ar.attendanceSettings.dto.ArStaFormulaDto;
import com.ait.ar.attendanceSettings.service.ArStaFormulaService;
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
public class ArStaFormulaController {
    private static final Logger log = LoggerFactory.getLogger(ArStaFormulaController.class);

    @Autowired
    private ArStaFormulaService service;

    @GetMapping("/viewSummaryFormula")
    public String viewSummaryFormula() {
        return "ar/attendanceSettings/viewSummaryFormula";
    }

    @GetMapping("/api/arStaFormula/treeItems")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTreeItems() {
        return ResponseEntity.ok(service.getLeftTreeItems());
    }

    @GetMapping("/api/arStaFormula")
    @ResponseBody
    public ResponseEntity<List<ArStaFormulaDto>> getFormulas(
            @RequestParam(required = false) String itemNo) {
        return ResponseEntity.ok(service.getFormulasByItemNo(itemNo));
    }

    @GetMapping("/api/arStaFormula/{formularNo}")
    @ResponseBody
    public ResponseEntity<ArStaFormulaDto> getFormulaById(@PathVariable Long formularNo) {
        ArStaFormulaDto dto = service.getFormulaById(formularNo);
        if (dto != null)
            return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/api/arStaFormula/tools/attItems")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getAttItems() {
        return ResponseEntity.ok(service.getAttItems());
    }

    @GetMapping("/api/arStaFormula/tools/staItems")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getStaItems() {
        return ResponseEntity.ok(service.getStaItems());
    }

    @GetMapping("/api/arStaFormula/tools/basicInfos")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getBasicInfos() {
        return ResponseEntity.ok(service.getBasicInfos());
    }

    @PostMapping("/api/arStaFormula/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveFormula(@RequestBody ArStaFormulaDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveFormula(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save summary formula formularNo={}", dto.getFormularNo(), e);
            response.put("error", "Loi he thong khi luu cong thuc tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/arStaFormula/delete/{formularNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteFormula(@PathVariable Long formularNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteFormula(formularNo);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete summary formula formularNo={}", formularNo, e);
            response.put("error", "Loi he thong khi xoa cong thuc tong hop.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
