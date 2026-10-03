package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduBasicPlanOption;
import com.ait.edu.trainEducation.model.EduPerson;
import com.ait.edu.trainEducation.service.EduBasicInfoService;
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
 * Thông tin đào tạo cơ bản (/edu/traineducation/trainBasicInformation) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). Thêm/Sửa/Xem dùng modal trên trang Angular.
 */
@Controller
@RequestMapping("/edu")
public class EduBasicInfoController {
    private static final Logger log = LoggerFactory.getLogger(EduBasicInfoController.class);

    @Autowired
    private EduBasicInfoService eduBasicInfoService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/trainBasicInformation")
    public String viewTrainBasicInformation(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/basicInfo/list")
    @ResponseBody
    public List<EduBasicInformation> getList(@RequestParam(required = false) String courseName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return eduBasicInfoService.findList(courseName, startDate, endDate);
    }

    @GetMapping("/api/basicInfo/detail")
    @ResponseBody
    public EduBasicInformation getDetail(@RequestParam String basicNo) {
        return eduBasicInfoService.getDetail(basicNo);
    }

    @GetMapping("/api/basicInfo/plans")
    @ResponseBody
    public List<EduBasicPlanOption> getPlans() {
        return eduBasicInfoService.findAvailablePlans();
    }

    @GetMapping("/api/basicInfo/planPrefill")
    @ResponseBody
    public Map<String, Object> getPlanPrefill(@RequestParam String planNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("data", eduBasicInfoService.getPlanPrefill(planNo));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi lay du lieu ke hoach, planNo={}", planNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi lay du lieu ke hoach.");
        }
        return result;
    }

    /** NV theo danh sách mã - popup chọn NV chỉ định / Nhân viên thực tế. */
    @GetMapping("/api/basicInfo/employees")
    @ResponseBody
    public List<EduPerson> getEmployees(@RequestParam(required = false) String empids) {
        return eduBasicInfoService.findEmployeesByEmpids(EduCommonController.splitCsv(empids));
    }

    /** Giảng viên theo danh sách mã - popup chọn Giảng viên đánh giá. */
    @GetMapping("/api/basicInfo/teachers")
    @ResponseBody
    public List<EduPerson> getTeachers(@RequestParam(required = false) String empids) {
        return eduBasicInfoService.findTeachersByEmpids(EduCommonController.splitCsv(empids));
    }

    @PostMapping("/api/basicInfo/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduBasicInformation entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("basicNo", eduBasicInfoService.add(entity));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi thong tin dao tao co ban", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi thong tin dao tao co ban.");
        }
        return result;
    }

    @PostMapping("/api/basicInfo/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduBasicInformation entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduBasicInfoService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat thong tin dao tao co ban, basicNo={}", entity.getBasicNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat thong tin dao tao co ban.");
        }
        return result;
    }

    @PostMapping("/api/basicInfo/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String basicNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduBasicInfoService.delete(basicNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa thong tin dao tao co ban, basicNo={}", basicNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa thong tin dao tao co ban.");
        }
        return result;
    }
}
