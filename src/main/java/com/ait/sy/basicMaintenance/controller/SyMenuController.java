package com.ait.sy.basicMaintenance.controller;

import com.ait.sy.basicMaintenance.dto.SyMenuDto;
import com.ait.sy.basicMaintenance.service.SyMenuService;

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
public class SyMenuController {
    private static final Logger log = LoggerFactory.getLogger(SyMenuController.class);

    @Autowired
    private SyMenuService syMenuService;

    @GetMapping("/basicMaintenance/viewMenuList")
    public String viewMenuList() {
        return "sys/basicMaintenance/viewMenuList";
    }

    @GetMapping("/api/menu/list")
    @ResponseBody
    public List<SyMenuDto> getList(@RequestParam(required = false) String keyword) {
        return syMenuService.findAll(keyword);
    }

    @PostMapping("/api/menu/save")
    @ResponseBody
    public Map<String, Object> save(@RequestBody SyMenuDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syMenuService.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
        } catch (Exception e) {
            log.error("Failed to save menu menuNo={}", dto.getMenuNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu menu.");
        }
        return response;
    }

    @PostMapping("/api/menu/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String menuNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            syMenuService.delete(menuNo);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete menu menuNo={}", menuNo, e);
            response.put("message", "Loi he thong khi xoa menu.");
        }
        return response;
    }

    @GetMapping("/api/menu/export")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] bytes = syMenuService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=MenuList.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }
}
