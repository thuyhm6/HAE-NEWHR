package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainReportMenu;
import com.ait.edu.trainEducation.model.EduTrainReportQuery;
import com.ait.edu.trainEducation.service.EduTrainReportService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

/**
 * Báo cáo đào tạo (/report/ar/viewTrainReport) - port từ ArReportCtroller.viewTrainReport
 * (cây loại báo cáo) + TrainReportCtroller (các báo cáo con: khóa học, chức vụ,
 * phòng ban, năm, tháng, hình thức) của Hanwha_HTSV.
 */
@Controller
public class EduTrainReportController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainReportController.class);

    @Autowired
    private EduTrainReportService eduTrainReportService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/report/ar/viewTrainReport")
    public String viewTrainReport(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/edu/api/trainReport/menu")
    @ResponseBody
    public List<EduTrainReportMenu> getMenu() {
        return eduTrainReportService.findMenu();
    }

    @GetMapping("/edu/api/trainReport/{type}/list")
    @ResponseBody
    public ResponseEntity<?> getReport(@PathVariable String type, @ModelAttribute EduTrainReportQuery query) {
        try {
            return ResponseEntity.ok(eduTrainReportService.findReport(type, query));
        } catch (BusinessException e) {
            Map<String, Object> result = new HashMap<>();
            EduCourseManagerController.putError(result, e);
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/edu/api/trainReport/{type}/export")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type, @ModelAttribute EduTrainReportQuery query) {
        try {
            return EduPlanManagerController.xlsxResponse(eduTrainReportService.exportReport(type, query),
                    "trainReport_" + type + ".xlsx");
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Loi khi xuat Excel bao cao dao tao, type={}", type, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
