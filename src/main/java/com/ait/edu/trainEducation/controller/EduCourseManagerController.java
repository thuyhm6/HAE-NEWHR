package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduCourseManager;
import com.ait.edu.trainEducation.service.EduCourseManagerService;
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
 * Quản lý khóa học (/edu/traineducation/courseManager) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). Thêm/Sửa dùng modal trên trang Angular.
 */
@Controller
@RequestMapping("/edu")
public class EduCourseManagerController {
    private static final Logger log = LoggerFactory.getLogger(EduCourseManagerController.class);

    @Autowired
    private EduCourseManagerService eduCourseManagerService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/courseManager")
    public String viewCourseManager(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/courseManager/list")
    @ResponseBody
    public List<EduCourseManager> getList(@RequestParam(required = false) String trainDiffCode,
            @RequestParam(required = false) String trainTypeCode,
            @RequestParam(required = false) String courseName) {
        return eduCourseManagerService.findList(trainDiffCode, trainTypeCode, courseName);
    }

    @GetMapping("/api/courseManager/detail")
    @ResponseBody
    public EduCourseManager getDetail(@RequestParam String courseNo) {
        return eduCourseManagerService.getDetail(courseNo);
    }

    @PostMapping("/api/courseManager/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduCourseManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("courseNumber", eduCourseManagerService.add(entity));
            result.put("success", true);
        } catch (BusinessException e) {
            putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi khoa hoc", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi khoa hoc.");
        }
        return result;
    }

    @PostMapping("/api/courseManager/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduCourseManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCourseManagerService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat khoa hoc, courseNo={}", entity.getCourseNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat khoa hoc.");
        }
        return result;
    }

    static void putError(Map<String, Object> result, BusinessException e) {
        result.put("success", false);
        result.put("errorCode", e.getErrorCode());
        result.put("message", e.getUserMessage());
    }
}
