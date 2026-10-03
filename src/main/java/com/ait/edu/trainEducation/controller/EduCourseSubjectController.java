package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduCourseSubject;
import com.ait.edu.trainEducation.service.EduCourseSubjectService;
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
 * Môn học đào tạo (/edu/traineducation/courseSubjects) - port từ
 * TrainEducationCtroller (Hanwha_HAE, vì Hanwha_HTSV không có màn này).
 */
@Controller
@RequestMapping("/edu")
public class EduCourseSubjectController {
    private static final Logger log = LoggerFactory.getLogger(EduCourseSubjectController.class);

    @Autowired
    private EduCourseSubjectService eduCourseSubjectService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/courseSubjects")
    public String viewCourseSubjects(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/courseSubjects/list")
    @ResponseBody
    public List<EduCourseSubject> getList(@RequestParam(required = false) String subjectNo,
            @RequestParam(required = false) String subjectName,
            @RequestParam(required = false) String mainBusiness) {
        return eduCourseSubjectService.findList(subjectNo, subjectName, mainBusiness);
    }

    @GetMapping("/api/courseSubjects/detail")
    @ResponseBody
    public EduCourseSubject getDetail(@RequestParam String subjectId) {
        return eduCourseSubjectService.getDetail(subjectId);
    }

    @PostMapping("/api/courseSubjects/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduCourseSubject entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCourseSubjectService.add(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi mon hoc", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi mon hoc.");
        }
        return result;
    }

    @PostMapping("/api/courseSubjects/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduCourseSubject entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCourseSubjectService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat mon hoc, subjectId={}", entity.getSubjectId(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat mon hoc.");
        }
        return result;
    }

    @PostMapping("/api/courseSubjects/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String subjectId) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduCourseSubjectService.delete(subjectId);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa mon hoc, subjectId={}", subjectId, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa mon hoc.");
        }
        return result;
    }
}
