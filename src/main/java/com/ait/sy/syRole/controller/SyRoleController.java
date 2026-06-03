package com.ait.sy.syRole.controller;

import com.ait.sy.syRole.dto.SyRoleDto;
import com.ait.sy.syRole.service.SyRoleService;

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
public class SyRoleController {
    private static final Logger log = LoggerFactory.getLogger(SyRoleController.class);

    @Autowired
    private SyRoleService syRoleService;

    @GetMapping("/syRole/viewRolesGroup")
    public String viewRolesGroup() {
        return "sys/syRole/viewRolesGroup";
    }

    @GetMapping("/api/role/list")
    @ResponseBody
    public List<SyRoleDto> getList(@RequestParam(required = false, defaultValue = "") String keyword) {
        return syRoleService.findAll(keyword);
    }

    @PostMapping("/api/role/save")
    @ResponseBody
    public Map<String, Object> save(@RequestBody SyRoleDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleService.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
        } catch (Exception e) {
            log.error("Failed to save role roleNo={}", dto.getRoleNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu vai tro.");
        }
        return response;
    }

    @PostMapping("/api/role/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String roleNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleService.delete(roleNo);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete role roleNo={}", roleNo, e);
            response.put("message", "Loi he thong khi xoa vai tro.");
        }
        return response;
    }

    @PostMapping("/api/role/saveRelations")
    @ResponseBody
    public Map<String, Object> saveRelations(@RequestBody SyRoleDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleService.saveRelations(dto);
            response.put("success", true);
            response.put("message", "Lưu quyền thành công!");
        } catch (Exception e) {
            log.error("Failed to save role relations roleNo={}", dto.getRoleNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu phan quyen vai tro.");
        }
        return response;
    }

    @GetMapping("/api/role/detail")
    @ResponseBody
    public SyRoleDto getDetail(@RequestParam String roleNo) {
        return syRoleService.findById(roleNo);
    }

    @GetMapping("/api/role/export")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] bytes = syRoleService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=RoleList.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }
}
