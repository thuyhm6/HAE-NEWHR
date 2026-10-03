package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduApplyCourse;
import com.ait.edu.trainEducation.model.EduApplyFlagRequest;
import com.ait.edu.trainEducation.model.EduApplyMaker;
import com.ait.edu.trainEducation.model.EduApplyQuery;
import com.ait.edu.trainEducation.model.EduApplyRecord;
import com.ait.edu.trainEducation.model.EduApplyRequest;
import com.ait.edu.trainEducation.service.EduCourseApplyService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

/**
 * Đăng ký khóa đào tạo và quy trình phê duyệt / xác nhận - port từ TrainEducationCtroller
 * (Hanwha_HTSV): courseApply (Đăng ký), courseMaker (Phê duyệt), courseConfirm (Xác nhận),
 * makerSituation / makerSituationHUB (Tình hình đăng ký).
 */
@Controller
@RequestMapping("/edu")
public class EduCourseApplyController {
    private static final Logger log = LoggerFactory.getLogger(EduCourseApplyController.class);

    @Autowired
    private EduCourseApplyService eduCourseApplyService;

    @Autowired
    private AngularIndexService angularIndexService;

    // ===== View =====

    @GetMapping({ "/traineducation/courseApply", "/traineducation/courseMaker", "/traineducation/courseConfirm",
            "/traineducation/makerSituation", "/traineducation/makerSituationHUB" })
    public String view(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ===== Đăng ký =====

    @GetMapping("/api/courseApply/courses")
    @ResponseBody
    public List<EduApplyCourse> getApplyCourses(@RequestParam(required = false) String courseName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return eduCourseApplyService.findApplyCourses(courseName, startDate, endDate);
    }

    @GetMapping("/api/courseApply/defaultMakers")
    @ResponseBody
    public List<EduApplyMaker> getDefaultMakers() {
        return eduCourseApplyService.findDefaultMakers();
    }

    @GetMapping("/api/courseApply/makers")
    @ResponseBody
    public List<EduApplyMaker> getMakers(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNo) {
        return eduCourseApplyService.findMakerCandidates(keyword, deptNo);
    }

    @PostMapping("/api/courseApply/apply")
    @ResponseBody
    public Map<String, Object> apply(@Valid @RequestBody EduApplyRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("count", eduCourseApplyService.apply(request));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi dang ky khoa dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi dang ky khoa dao tao.");
        }
        return result;
    }

    // ===== Phê duyệt =====

    @GetMapping("/api/courseMaker/list")
    @ResponseBody
    public List<EduApplyRecord> getMakerRecords(@ModelAttribute EduApplyQuery query) {
        return eduCourseApplyService.findMakerRecords(query);
    }

    @PostMapping("/api/courseMaker/update")
    @ResponseBody
    public Map<String, Object> updateMaker(@Valid @RequestBody EduApplyFlagRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("count", eduCourseApplyService.updateMakerFlag(request));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat phe duyet", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat phe duyet.");
        }
        return result;
    }

    // ===== Xác nhận =====

    @GetMapping("/api/courseConfirm/list")
    @ResponseBody
    public List<EduApplyRecord> getConfirmRecords(@ModelAttribute EduApplyQuery query) {
        return eduCourseApplyService.findConfirmRecords(query);
    }

    @PostMapping("/api/courseConfirm/update")
    @ResponseBody
    public Map<String, Object> updateConfirm(@Valid @RequestBody EduApplyFlagRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("count", eduCourseApplyService.updateConfirmFlag(request));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat xac nhan", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat xac nhan.");
        }
        return result;
    }

    // ===== Tình hình đăng ký =====

    @GetMapping("/api/makerSituation/list")
    @ResponseBody
    public List<EduApplyRecord> getSituation(@ModelAttribute EduApplyQuery query,
            @RequestParam(defaultValue = "false") boolean hub) {
        return eduCourseApplyService.findSituationRecords(query, hub);
    }

    @GetMapping("/api/makerSituation/role")
    @ResponseBody
    public Map<String, Object> getSituationRole() {
        Map<String, Object> result = new HashMap<>();
        result.put("manager", eduCourseApplyService.isSituationManager());
        return result;
    }

    @PostMapping("/api/makerSituation/cancel")
    @ResponseBody
    public Map<String, Object> cancel(@RequestParam String applyNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCourseApplyService.cancelApply(applyNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi huy don dang ky, applyNo={}", applyNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi huy don dang ky.");
        }
        return result;
    }
}
