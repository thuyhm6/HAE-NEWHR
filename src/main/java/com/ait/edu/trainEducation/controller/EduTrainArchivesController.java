package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainArchiveQuery;
import com.ait.edu.trainEducation.service.EduTrainArchivesService;
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
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

/**
 * Hồ sơ đào tạo (/edu/traineducation/trainArchives) - port từ
 * TrainEducationCtroller.trainArchives (Hanwha_HTSV): tra cứu lịch sử đào tạo
 * của nhân viên + file báo cáo, xuất Excel.
 */
@Controller
@RequestMapping("/edu")
public class EduTrainArchivesController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainArchivesController.class);

    @Autowired
    private EduTrainArchivesService eduTrainArchivesService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/trainArchives")
    public String viewTrainArchives(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/trainArchives/list")
    @ResponseBody
    public ResponseEntity<?> getList(@ModelAttribute EduTrainArchiveQuery query) {
        try {
            return ResponseEntity.ok(eduTrainArchivesService.findList(query));
        } catch (BusinessException e) {
            Map<String, Object> result = new HashMap<>();
            EduCourseManagerController.putError(result, e);
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/api/trainArchives/export")
    public ResponseEntity<byte[]> export(@ModelAttribute EduTrainArchiveQuery query) {
        try {
            return EduPlanManagerController.xlsxResponse(eduTrainArchivesService.export(query), "trainArchives.xlsx");
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Loi khi xuat Excel ho so dao tao", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
