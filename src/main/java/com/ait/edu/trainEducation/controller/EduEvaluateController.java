package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduEvalCourse;
import com.ait.edu.trainEducation.model.EduFreeEmployee;
import com.ait.edu.trainEducation.model.EduImportResult;
import com.ait.edu.trainEducation.model.EduScoreStat;
import com.ait.edu.trainEducation.model.EduStudentScoreRequest;
import com.ait.edu.trainEducation.model.EduTeacherCheck;
import com.ait.edu.trainEducation.model.EduTrainResult;
import com.ait.edu.trainEducation.service.EduEvaluateService;
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
 * 3 màn đánh giá đào tạo (port từ TrainEducationCtroller - Hanwha_HTSV):
 * /edu/traineducation/studentEvaluate, /teacherEvaluate, /trainResult.
 */
@Controller
@RequestMapping("/edu")
public class EduEvaluateController {
    private static final Logger log = LoggerFactory.getLogger(EduEvaluateController.class);

    @Autowired
    private EduEvaluateService eduEvaluateService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping({"/traineducation/studentEvaluate", "/traineducation/teacherEvaluate", "/traineducation/trainResult"})
    public String viewEvaluate(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ===== Chung =====

    @GetMapping("/api/evaluate/courses")
    @ResponseBody
    public List<EduEvalCourse> getCourses(@RequestParam String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return eduEvaluateService.findCourses(type, startDate, endDate);
    }

    @GetMapping("/api/evaluate/course")
    @ResponseBody
    public EduBasicInformation getCourse(@RequestParam String basicNo) {
        return eduEvaluateService.getCourse(basicNo);
    }

    // ===== Đánh giá học viên =====

    @GetMapping("/api/studentEvaluate/students")
    @ResponseBody
    public List<EduFreeEmployee> getStudents(@RequestParam String basicNo) {
        return eduEvaluateService.getStudents(basicNo);
    }

    @PostMapping("/api/studentEvaluate/save")
    @ResponseBody
    public Map<String, Object> saveStudentScores(@Valid @RequestBody EduStudentScoreRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduEvaluateService.saveStudentScores(request.getBasicNo(), request.getScores());
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi luu diem thi, basicNo={}", request.getBasicNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi luu diem thi.");
        }
        return result;
    }

    @PostMapping("/api/studentEvaluate/import")
    @ResponseBody
    public Map<String, Object> importStudentScores(@RequestParam String basicNo, @RequestParam("file") MultipartFile file) {
        return doImport("diem thi", basicNo, file, in -> eduEvaluateService.importStudentScores(basicNo, in));
    }

    @GetMapping("/api/studentEvaluate/template")
    public ResponseEntity<byte[]> studentTemplate() {
        return xlsx(eduEvaluateService::buildStudentTemplate, "studentEva_demo.xlsx");
    }

    @GetMapping("/api/studentEvaluate/export")
    public ResponseEntity<byte[]> exportStudents(@RequestParam String basicNo) {
        return xlsx(() -> eduEvaluateService.exportStudents(basicNo), "studentEva.xlsx");
    }

    // ===== Đánh giá giảng viên =====

    @GetMapping("/api/teacherEvaluate/stats")
    @ResponseBody
    public List<EduScoreStat> getTeacherStats(@RequestParam String basicNo) {
        return eduEvaluateService.getTeacherStats(basicNo);
    }

    @GetMapping("/api/teacherEvaluate/checks")
    @ResponseBody
    public List<EduTeacherCheck> getTeacherChecks(@RequestParam String basicNo, @RequestParam String teaEmpid) {
        return eduEvaluateService.getTeacherChecks(basicNo, teaEmpid);
    }

    @PostMapping("/api/teacherEvaluate/import")
    @ResponseBody
    public Map<String, Object> importTeacherScores(@RequestParam String basicNo, @RequestParam String teaEmpid,
            @RequestParam("file") MultipartFile file) {
        return doImport("danh gia giang vien", basicNo, file,
                in -> eduEvaluateService.importTeacherScores(basicNo, teaEmpid, in));
    }

    @GetMapping("/api/teacherEvaluate/template")
    public ResponseEntity<byte[]> teacherTemplate() {
        return xlsx(eduEvaluateService::buildTeacherTemplate, "TeacherEvaluate_demo.xlsx");
    }

    @GetMapping("/api/teacherEvaluate/export")
    public ResponseEntity<byte[]> exportTeacherStats(@RequestParam String basicNo) {
        return xlsx(() -> eduEvaluateService.exportTeacherStats(basicNo), "TeacherEvaluate.xlsx");
    }

    // ===== Kết quả đào tạo =====

    @GetMapping("/api/trainResult/stats")
    @ResponseBody
    public List<EduScoreStat> getResultStats(@RequestParam String basicNo) {
        return eduEvaluateService.getResultStats(basicNo);
    }

    @GetMapping("/api/trainResult/list")
    @ResponseBody
    public List<EduTrainResult> getTrainResults(@RequestParam String basicNo,
            @RequestParam(defaultValue = "false") boolean onlyEvaluated) {
        return eduEvaluateService.getTrainResults(basicNo, onlyEvaluated);
    }

    @PostMapping("/api/trainResult/import")
    @ResponseBody
    public Map<String, Object> importResultScores(@RequestParam String basicNo, @RequestParam("file") MultipartFile file) {
        return doImport("ket qua dao tao", basicNo, file, in -> eduEvaluateService.importResultScores(basicNo, in));
    }

    @GetMapping("/api/trainResult/template")
    public ResponseEntity<byte[]> resultTemplate() {
        return xlsx(eduEvaluateService::buildResultTemplate, "trainResult_demo_ev.xlsx");
    }

    @GetMapping("/api/trainResult/export")
    public ResponseEntity<byte[]> exportResults(@RequestParam String basicNo) {
        return xlsx(() -> eduEvaluateService.exportResults(basicNo), "trainResult.xlsx");
    }

    // ===== Tiện ích =====

    @FunctionalInterface
    interface ImportAction {
        EduImportResult run(InputStream in) throws IOException;
    }

    @FunctionalInterface
    interface ExcelSupplier {
        byte[] get() throws IOException;
    }

    private Map<String, Object> doImport(String what, String basicNo, MultipartFile file, ImportAction action) {
        Map<String, Object> result = new HashMap<>();
        try (InputStream in = file.getInputStream()) {
            EduImportResult r = action.run(in);
            result.put("success", r.isSuccess());
            result.put("errors", r.getErrors());
            result.put("warnings", r.getWarnings());
            result.put("updatedCount", r.getUpdatedCount());
        } catch (Exception e) {
            log.error("Loi khi import {}, basicNo={}", what, basicNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi import.");
        }
        return result;
    }

    private ResponseEntity<byte[]> xlsx(ExcelSupplier supplier, String fileName) {
        try {
            return EduPlanManagerController.xlsxResponse(supplier.get(), fileName);
        } catch (Exception e) {
            log.error("Loi khi tao file Excel {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
