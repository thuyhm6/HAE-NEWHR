package com.ait.sy.basicMaintenance.controller;

import com.ait.sy.basicMaintenance.dto.SyMenuParamDto;
import com.ait.sy.basicMaintenance.service.SyMenuParamService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/sys")
public class SyMenuParamController {
    private static final Logger log = LoggerFactory.getLogger(SyMenuParamController.class);

    @Autowired
    private SyMenuParamService syMenuParamService;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/menu/viewMenuParamList")
    public String viewMenuParamList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/menu_param/list")
    @ResponseBody
    public List<SyMenuParamDto> getList(
            @RequestParam(required = false) String parentMenuNo,
            @RequestParam String cpnyId) {
        return syMenuParamService.findByParentMenuAndCpny(parentMenuNo, cpnyId);
    }

    @PostMapping("/api/menu_param/save")
    @ResponseBody
    public Map<String, Object> save(@RequestBody SyMenuParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syMenuParamService.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
        } catch (Exception e) {
            log.error("Failed to save menu param cpnyId={} menuNo={}", dto.getCpnyId(), dto.getMenuNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu thong so menu.");
        }
        return response;
    }

    @PostMapping("/api/menu_param/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody SyMenuParamDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syMenuParamService.delete(dto.getCpnyId(), dto.getMenuNo());
            response.put("success", true);
            response.put("message", "Xóa thành công!");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete menu param cpnyId={} menuNo={}", dto.getCpnyId(), dto.getMenuNo(), e);
            response.put("message", "Loi he thong khi xoa thong so menu.");
        }
        return response;
    }

    @GetMapping("/api/menu_param/export")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) String parentMenuNo,
            @RequestParam String cpnyId) {
        byte[] bytes = syMenuParamService.exportExcel(parentMenuNo, cpnyId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"MenuParams.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
