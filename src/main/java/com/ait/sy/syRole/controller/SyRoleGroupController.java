package com.ait.sy.syRole.controller;

import com.ait.sy.syRole.dto.SyRoleGroupDto;
import com.ait.sy.syRole.service.SyRoleGroupService;

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
public class SyRoleGroupController {
    private static final Logger log = LoggerFactory.getLogger(SyRoleGroupController.class);

    @Autowired
    private SyRoleGroupService syRoleGroupService;

    @GetMapping("/syRole/viewSyRolesGroupList")
    public String viewSyRolesGroupList() {
        return "sys/syRole/viewSyRolesGroupList";
    }

    @GetMapping("/api/role_group/list")
    @ResponseBody
    public List<SyRoleGroupDto> getList(@RequestParam(required = false) String keyword) {
        return syRoleGroupService.findAll(keyword);
    }

    @GetMapping("/api/role_group/detail")
    @ResponseBody
    public SyRoleGroupDto getDetail(@RequestParam String roleGroupNo) {
        return syRoleGroupService.findByRoleGroupNo(roleGroupNo);
    }

    @PostMapping("/api/role_group/save")
    @ResponseBody
    public Map<String, Object> save(@RequestBody SyRoleGroupDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleGroupService.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công!");
        } catch (Exception e) {
            log.error("Failed to save role group roleGroupNo={}", dto.getRoleGroupNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu nhom vai tro.");
        }
        return response;
    }

    @PostMapping("/api/role_group/saveRelations")
    @ResponseBody
    public Map<String, Object> saveRelations(@RequestBody SyRoleGroupDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleGroupService.saveRelations(dto.getRoleGroupNo(), dto.getRoleNos());
            response.put("success", true);
            response.put("message", "Lưu phân quyền thành công!");
        } catch (Exception e) {
            log.error("Failed to save role group relations roleGroupNo={}", dto.getRoleGroupNo(), e);
            response.put("success", false);
            response.put("message", "Loi he thong khi luu phan quyen nhom vai tro.");
        }
        return response;
    }

    @PostMapping("/api/role_group/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String roleGroupId) {
        Map<String, Object> response = new HashMap<>();
        try {
            syRoleGroupService.delete(roleGroupId);
            response.put("success", true);
            response.put("message", "Xóa thành công!");
        } catch (Exception e) {
            response.put("success", false);
            log.error("Failed to delete role group roleGroupId={}", roleGroupId, e);
            response.put("message", "Loi he thong khi xoa nhom vai tro.");
        }
        return response;
    }

    @GetMapping("/api/role_group/export")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] bytes = syRoleGroupService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=RoleGroups.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }
}
