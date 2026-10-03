package com.ait.org.orgManage.controller;

import com.ait.util.CollectionUtil;

import com.ait.org.orgManage.model.OrgCostCenter;
import com.ait.org.orgManage.service.OrgCostCenterService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Controller
public class OrgCostCenterController {
    private static final Logger log = LoggerFactory.getLogger(OrgCostCenterController.class);

    @Autowired
    private OrgCostCenterService service;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/org/orgManage/viewOrgCostCenter")
    public String viewOrgCostCenter(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @PostMapping("/org/api/costCenter/list")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> getList(@RequestBody Map<String, String> payload) {
        try {
            String codeNo = payload.get("codeNo");
            String codeName = payload.get("codeName");
            List<OrgCostCenter> list = service.getList(codeNo, codeName);
            return org.springframework.http.ResponseEntity.ok(CollectionUtil.mapOf("data", list));
        } catch (Exception e) {
            log.error("Failed to get cost center list", e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(CollectionUtil.mapOf("error", "Loi he thong khi tai danh sach trung tam chi phi."));
        }
    }

    @PostMapping("/org/api/costCenter/save")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> save(
            @RequestBody OrgCostCenter obj, HttpSession session) {
        try {
            HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
            if (user != null) {
                if (obj.getSeq() == null || obj.getSeq().isEmpty()) {
                    obj.setCreatedBy(user.getUsername());
                    // obj.setCreatedIp(user.getIpAddress());
                }
                obj.setUpdatedBy(user.getUsername());
                // obj.setUpdatedIp(user.getIpAddress());
            }
            service.save(obj);
            return org.springframework.http.ResponseEntity.ok(CollectionUtil.mapOf("message", "Lưu thành công"));
        } catch (Exception e) {
            log.error("Failed to save cost center seq={}", obj.getSeq(), e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(CollectionUtil.mapOf("error", "Loi he thong khi luu trung tam chi phi."));
        }
    }

    @PostMapping("/org/api/costCenter/delete")
    @ResponseBody
    public org.springframework.http.ResponseEntity<?> delete(@RequestParam String seq) {
        try {
            service.delete(seq);
            return org.springframework.http.ResponseEntity.ok(CollectionUtil.mapOf("message", "Xóa thành công"));
        } catch (Exception e) {
            log.error("Failed to delete cost center seq={}", seq, e);
            return org.springframework.http.ResponseEntity.status(500)
                    .body(CollectionUtil.mapOf("error", "Loi he thong khi xoa trung tam chi phi."));
        }
    }
}
