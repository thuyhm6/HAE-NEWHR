package com.ait.sy.basicMaintenance.controller;

import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;
import com.ait.sy.basicMaintenance.service.SyCodeParamService;

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
@RequestMapping("/sys")
public class SyCodeParamController {
    private static final Logger log = LoggerFactory.getLogger(SyCodeParamController.class);

    @Autowired
    private SyCodeParamService syCodeParamService;

    // View Mapping
    @GetMapping("/basicMaintenance/viewCodePamers")
    public String viewCodePamers() {
        return "sys/basicMaintenance/viewCodePamers";
    }

    // API Mappings
    @GetMapping("/api/code_param/list")
    @ResponseBody
    public List<SyCodeParamDto> getList(@RequestParam(required = false) String parentCodeNo,
            @RequestParam String cpnyId) {
        return syCodeParamService.getList(parentCodeNo, cpnyId);
    }

    @PostMapping("/api/code_param/save")
    @ResponseBody
    public ResponseEntity<?> save(@RequestBody SyCodeParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syCodeParamService.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to save code param codeNo={} cpnyId={}", dto.getCodeNo(), dto.getCpnyId(), e);
            response.put("message", "Loi he thong khi luu tham so ma.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/code_param/update")
    @ResponseBody
    public ResponseEntity<?> update(@RequestBody SyCodeParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Note: dto fields mapped from JSON: codeNo, cpnyId, orderNo, activity
            syCodeParamService.update(dto);
            response.put("success", true);
            response.put("message", "Cập nhật thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to update code param codeNo={} cpnyId={}", dto.getCodeNo(), dto.getCpnyId(), e);
            response.put("message", "Loi he thong khi cap nhat tham so ma.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/code_param/delete")
    @ResponseBody
    public ResponseEntity<?> delete(@RequestBody SyCodeParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syCodeParamService.delete(dto.getCodeNo(), dto.getCpnyId());
            response.put("success", true);
            response.put("message", "Xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete code param codeNo={} cpnyId={}", dto.getCodeNo(), dto.getCpnyId(), e);
            response.put("message", "Loi he thong khi xoa tham so ma.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/code_param/export")
    public void export(@RequestParam String cpnyId, @RequestParam(required = false) String parentCode) {
        // Implement export logic later if needed
    }
}
