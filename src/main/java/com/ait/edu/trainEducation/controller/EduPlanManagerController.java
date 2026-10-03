package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.model.EduTrainSyllabus;
import com.ait.edu.trainEducation.service.EduPlanManagerService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
 * Kế hoạch đào tạo (/edu/traineducation/planManager) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). Thêm/Sửa/Xem/Lịch học dùng modal trên trang Angular.
 */
@Controller
@RequestMapping("/edu")
public class EduPlanManagerController {
    private static final Logger log = LoggerFactory.getLogger(EduPlanManagerController.class);

    static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @Autowired
    private EduPlanManagerService eduPlanManagerService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/planManager")
    public String viewPlanManager(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/planManager/list")
    @ResponseBody
    public List<EduPlanManager> getList(@RequestParam(required = false) String trainDiffCode,
            @RequestParam(required = false) String trainTypeCode,
            @RequestParam(required = false) String courseName) {
        return eduPlanManagerService.findList(trainDiffCode, trainTypeCode, courseName);
    }

    @GetMapping("/api/planManager/detail")
    @ResponseBody
    public EduPlanManager getDetail(@RequestParam String planNo) {
        return eduPlanManagerService.getDetail(planNo);
    }

    @GetMapping("/api/planManager/nextPlanNo")
    @ResponseBody
    public Map<String, Object> nextPlanNo() {
        Map<String, Object> result = new HashMap<>();
        result.put("planNo", eduPlanManagerService.nextPlanNo());
        return result;
    }

    @PostMapping("/api/planManager/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduPlanManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduPlanManagerService.add(entity);
            result.put("success", true);
            result.put("planNo", entity.getPlanNo());
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi ke hoach dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi ke hoach dao tao.");
        }
        return result;
    }

    @PostMapping("/api/planManager/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduPlanManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduPlanManagerService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat ke hoach dao tao, planNo={}", entity.getPlanNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat ke hoach dao tao.");
        }
        return result;
    }

    @PostMapping("/api/planManager/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String planNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduPlanManagerService.delete(planNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa ke hoach dao tao, planNo={}", planNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa ke hoach dao tao.");
        }
        return result;
    }

    // ===== Lịch học =====

    @GetMapping("/api/planManager/syllabus")
    @ResponseBody
    public List<EduTrainSyllabus> getSyllabus(@RequestParam String planNo) {
        return eduPlanManagerService.findSyllabus(planNo);
    }

    @PostMapping("/api/planManager/syllabus/delete")
    @ResponseBody
    public Map<String, Object> deleteSyllabus(@RequestParam String syllNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduPlanManagerService.deleteSyllabus(syllNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa lich hoc, syllNo={}", syllNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa lich hoc.");
        }
        return result;
    }

    @PostMapping("/api/planManager/syllabus/import")
    @ResponseBody
    public Map<String, Object> importSyllabus(@RequestParam String planNo, @RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try (InputStream in = file.getInputStream()) {
            List<String> errors = eduPlanManagerService.importSyllabus(planNo, in);
            result.put("success", errors.isEmpty());
            result.put("errors", errors);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi import lich hoc, planNo={}", planNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi import lich hoc.");
        }
        return result;
    }

    @GetMapping("/api/planManager/syllabus/template")
    public ResponseEntity<byte[]> downloadSyllabusTemplate() {
        try {
            return xlsxResponse(eduPlanManagerService.buildSyllabusTemplate(), "planCourse_demo.xlsx");
        } catch (Exception e) {
            log.error("Loi khi tai file mau lich hoc", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    static ResponseEntity<byte[]> xlsxResponse(byte[] data, String fileName) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(XLSX)
                .body(data);
    }
}
