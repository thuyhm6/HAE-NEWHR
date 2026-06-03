package com.ait.sy.syAffirm.controller;

import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.service.SyAffirmEmailService;
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
@RequestMapping("/sy/syAffirm/api")
public class SyAffirmEmailController {
    private static final Logger log = LoggerFactory.getLogger(SyAffirmEmailController.class);

    @Autowired
    private SyAffirmEmailService service;

    @GetMapping("/pending-counts")
    @ResponseBody
    public ResponseEntity<Map<String, Integer>> getPendingCounts() {
        return ResponseEntity.ok(service.getPendingApprovalCounts());
    }

    @GetMapping("/hrm-pending-counts")
    @ResponseBody
    public ResponseEntity<Map<String, Integer>> getHrmPendingCounts() {
        return ResponseEntity.ok(service.getHrmPendingCounts());
    }

    @GetMapping("/list")
    public ResponseEntity<List<SyAffirmEmailDto>> getList(SyAffirmEmailDto dto) {
        return ResponseEntity.ok(service.getList(dto));
    }

    @GetMapping("/{seq}")
    public ResponseEntity<SyAffirmEmailDto> getById(@PathVariable String seq) {
        return ResponseEntity.ok(service.getById(seq));
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody SyAffirmEmailDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công");
        } catch (Exception e) {
            log.error("Failed to save affirmation email seq={}", dto.getSeq(), e);
            response.put("success", false);
            response.put("error", "Loi he thong khi luu thong tin xac nhan email.");
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{seq}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String seq) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.delete(seq);
            response.put("success", true);
            response.put("message", "Xóa thành công");
        } catch (Exception e) {
            log.error("Failed to delete affirmation email seq={}", seq, e);
            response.put("success", false);
            response.put("error", "Loi he thong khi xoa thong tin xac nhan email.");
        }
        return ResponseEntity.ok(response);
    }
}
