package com.ait.org.orgManage.controller;

import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.org.orgManage.dto.OrgNode;
import com.ait.org.orgManage.model.HrDepartment;
import com.ait.org.orgManage.service.CurrentOrgService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class CurrentOrgController {
    private static final Logger log = LoggerFactory.getLogger(CurrentOrgController.class);

    @Autowired
    private CurrentOrgService service;

    @GetMapping("/org/orgManage/viewCurrentOrgInfo")
    public String viewCurrentOrgInfo(Model model, HttpSession session) {
        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null) {
            return "redirect:/login";
        }
        model.addAttribute("currentHrUser", user);
        model.addAttribute("title", "Sơ đồ tổ chức hiện tại");
        return "org/orgManage/viewCurrentOrgInfo";
    }

    @GetMapping("/org/orgManage/viewOrgInfo")
    public String viewOrgInfo(Model model, HttpSession session) {
        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null) {
            return "redirect:/login";
        }
        model.addAttribute("currentHrUser", user);
        model.addAttribute("title", "Cấu trúc tổ chức");
        return "org/orgManage/viewOrgInfo";
    }

    @GetMapping("/org/api/current/structure")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> getStructure() {
        try {
            List<HrDepartment> list = service.getOrgTree();
            return org.springframework.http.ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Failed to load current org structure", e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Loi he thong khi tai cau truc to chuc."));
        }
    }

    @GetMapping("/org/api/visual/tree")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> getVisualTree() {
        try {
            List<OrgNode> list = service.getVisualOrgTree();
            return org.springframework.http.ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Failed to load visual org tree", e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Loi he thong khi tai so do to chuc."));
        }
    }

    @GetMapping("/org/api/current/employees")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> getEmployees(@RequestParam String deptNo) {
        try {
            List<HrEmployee> list = service.getEmployeeList(deptNo);
            return org.springframework.http.ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Failed to load employees for deptNo={}", deptNo, e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Loi he thong khi tai danh sach nhan vien."));
        }
    }
}
