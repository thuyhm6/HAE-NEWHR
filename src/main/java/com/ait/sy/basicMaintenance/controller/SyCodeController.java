package com.ait.sy.basicMaintenance.controller;

import com.ait.sy.basicMaintenance.dto.SyCodeDto;
import com.ait.sy.basicMaintenance.service.SyCodeService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/sys")
public class SyCodeController {
    private static final Logger log = LoggerFactory.getLogger(SyCodeController.class);

    @Autowired
    private SyCodeService syCodeService;

    @GetMapping("/basicMaintenance/viewCodeManage")
    public String viewCodeManage() {
        return "sys/basicMaintenance/viewCodeManage";
    }

    @GetMapping("/api/code/tree")
    @ResponseBody
    public List<SyCodeDto> getCodeTree() {
        return syCodeService.getCodeTree();
    }

    @GetMapping("/api/code/list")
    @ResponseBody
    public List<SyCodeDto> getCodeList(@RequestParam(required = false) String parentCodeNo) {
        return syCodeService.getCodeList(parentCodeNo);
    }

    @PostMapping("/api/code/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveCode(@RequestBody SyCodeDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syCodeService.saveCode(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to save code codeNo={}", dto.getCodeNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu ma danh muc.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/code/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCode(@RequestParam String codeNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            syCodeService.deleteCode(codeNo);
            response.put("success", true);
            response.put("message", "Xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete code codeNo={}", codeNo, e);
            response.put("success", false);
            response.put("message", "Loi he thong khi xoa ma danh muc.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/code/export")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] data = syCodeService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"code_list.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }
}
