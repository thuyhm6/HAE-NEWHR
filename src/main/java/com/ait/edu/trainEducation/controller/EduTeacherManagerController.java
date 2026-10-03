package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTeacherManager;
import com.ait.edu.trainEducation.service.EduTeacherManagerService;
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
 * Quản lý giảng viên (/edu/traineducation/teacherManager) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). API danh sách cũng dùng cho popup chọn
 * giảng viên ở Kế hoạch đào tạo (teacherSearch bản gốc).
 */
@Controller
@RequestMapping("/edu")
public class EduTeacherManagerController {
    private static final Logger log = LoggerFactory.getLogger(EduTeacherManagerController.class);

    @Autowired
    private EduTeacherManagerService eduTeacherManagerService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/teacherManager")
    public String viewTeacherManager(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/teacherManager/list")
    @ResponseBody
    public List<EduTeacherManager> getList(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String teachFieldCode,
            @RequestParam(required = false) String teachLevelCode,
            @RequestParam(required = false) String teachStatusCode) {
        return eduTeacherManagerService.findList(keyword, teachFieldCode, teachLevelCode, teachStatusCode);
    }

    @GetMapping("/api/teacherManager/detail")
    @ResponseBody
    public EduTeacherManager getDetail(@RequestParam String teacherNo) {
        return eduTeacherManagerService.getDetail(teacherNo);
    }

    @PostMapping("/api/teacherManager/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduTeacherManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTeacherManagerService.add(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi giang vien", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi giang vien.");
        }
        return result;
    }

    @PostMapping("/api/teacherManager/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduTeacherManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTeacherManagerService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat giang vien, teacherNo={}", entity.getTeacherNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat giang vien.");
        }
        return result;
    }

    @PostMapping("/api/teacherManager/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String teacherNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTeacherManagerService.delete(teacherNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa giang vien, teacherNo={}", teacherNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa giang vien.");
        }
        return result;
    }
}
