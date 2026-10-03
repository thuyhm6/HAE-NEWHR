package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduDeptNode;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API tra cứu dùng chung cho các màn đào tạo (cây phòng ban, chọn nhân viên,
 * file đính kèm). Download file dùng lại /ess/empinfo/api/files/download/{fileNo}.
 */
@Controller
@RequestMapping("/edu/api")
public class EduCommonController {
    private static final Logger log = LoggerFactory.getLogger(EduCommonController.class);

    @Autowired
    private EduCommonService eduCommonService;

    @GetMapping("/common/deptTree")
    @ResponseBody
    public List<EduDeptNode> getDeptTree() {
        return eduCommonService.getDeptTree();
    }

    @GetMapping("/common/employees")
    @ResponseBody
    public List<EduEmployeeLookup> findEmployees(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String deptRoot,
            @RequestParam(required = false) String orderBy) {
        return eduCommonService.findEmployees(keyword, splitCsv(deptNos), deptRoot, orderBy);
    }

    @GetMapping("/files/list")
    @ResponseBody
    public List<EduFile> getFiles(@RequestParam String applyType, @RequestParam String applyNo) {
        return eduCommonService.getFiles(applyType, applyNo);
    }

    @PostMapping("/files/upload")
    @ResponseBody
    public Map<String, Object> uploadFiles(@RequestParam String applyType, @RequestParam String applyNo,
            @RequestParam("files") List<MultipartFile> files) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("files", eduCommonService.uploadFiles(applyType, applyNo, files));
            result.put("success", true);
        } catch (BusinessException e) {
            result.put("success", false);
            result.put("errorCode", e.getErrorCode());
            result.put("message", e.getUserMessage());
        } catch (Exception e) {
            log.error("Loi khi upload file dinh kem, applyType={}, applyNo={}", applyType, applyNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi upload file.");
        }
        return result;
    }

    @PostMapping("/files/delete")
    @ResponseBody
    public Map<String, Object> deleteFile(@RequestParam String fileNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCommonService.deleteFile(fileNo);
            result.put("success", true);
        } catch (BusinessException e) {
            result.put("success", false);
            result.put("errorCode", e.getErrorCode());
            result.put("message", e.getUserMessage());
        } catch (Exception e) {
            log.error("Loi khi xoa file dinh kem, fileNo={}", fileNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa file.");
        }
        return result;
    }

    static List<String> splitCsv(String csv) {
        List<String> list = new ArrayList<>();
        if (csv == null || csv.trim().isEmpty()) {
            return list;
        }
        Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(list::add);
        return list;
    }
}
