package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainAgreement;
import com.ait.edu.trainEducation.service.EduTrainAgreementService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

/**
 * Hợp đồng đào tạo (/edu/traineducation/trainAgreement) - port từ
 * TrainEducationCtroller (Hanwha_HTSV): CRUD, import Excel, tải file mẫu, xuất Excel.
 */
@Controller
@RequestMapping("/edu")
public class EduTrainAgreementController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainAgreementController.class);

    @Autowired
    private EduTrainAgreementService eduTrainAgreementService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/trainAgreement")
    public String viewTrainAgreement(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/trainAgreement/list")
    @ResponseBody
    public List<EduTrainAgreement> getList(@RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String conStartDate,
            @RequestParam(required = false) String conEndDate) {
        return eduTrainAgreementService.findList(deptNo, keyword, conStartDate, conEndDate);
    }

    @GetMapping("/api/trainAgreement/detail")
    @ResponseBody
    public EduTrainAgreement getDetail(@RequestParam String agreeNo) {
        return eduTrainAgreementService.getDetail(agreeNo);
    }

    @PostMapping("/api/trainAgreement/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduTrainAgreement entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("agreeNo", eduTrainAgreementService.add(entity));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi hop dong dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi hop dong dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainAgreement/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduTrainAgreement entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainAgreementService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat hop dong dao tao, agreeNo={}", entity.getAgreeNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat hop dong dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainAgreement/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String agreeNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainAgreementService.delete(agreeNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa hop dong dao tao, agreeNo={}", agreeNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa hop dong dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainAgreement/import")
    @ResponseBody
    public Map<String, Object> importExcel(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try (InputStream in = file.getInputStream()) {
            List<String> errors = eduTrainAgreementService.importExcel(in);
            result.put("success", errors.isEmpty());
            result.put("errors", errors);
        } catch (Exception e) {
            log.error("Loi khi import hop dong dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi import hop dong dao tao.");
        }
        return result;
    }

    @GetMapping("/api/trainAgreement/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            return EduPlanManagerController.xlsxResponse(eduTrainAgreementService.buildTemplate(),
                    "trainAgreement_demo.xlsx");
        } catch (Exception e) {
            log.error("Loi khi tai file mau hop dong dao tao", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/trainAgreement/export")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String conStartDate,
            @RequestParam(required = false) String conEndDate) {
        try {
            return EduPlanManagerController.xlsxResponse(
                    eduTrainAgreementService.export(deptNo, keyword, conStartDate, conEndDate), "trainAgreement.xlsx");
        } catch (Exception e) {
            log.error("Loi khi xuat Excel hop dong dao tao", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
