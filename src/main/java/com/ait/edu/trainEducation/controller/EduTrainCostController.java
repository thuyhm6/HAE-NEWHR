package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainCost;
import com.ait.edu.trainEducation.service.EduTrainCostService;
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
import javax.validation.Valid;

/**
 * Chi phí đào tạo (/edu/traineducation/trainCostManager) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). Dòng chi phí được tạo khi lập khóa
 * (Thông tin đào tạo cơ bản) nên màn này chỉ Sửa/Xóa/Xuất Excel.
 */
@Controller
@RequestMapping("/edu")
public class EduTrainCostController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainCostController.class);

    @Autowired
    private EduTrainCostService eduTrainCostService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/trainCostManager")
    public String viewTrainCostManager(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/trainCost/list")
    @ResponseBody
    public List<EduTrainCost> getList(@RequestParam(required = false) String courseName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return eduTrainCostService.findList(courseName, startDate, endDate);
    }

    @GetMapping("/api/trainCost/detail")
    @ResponseBody
    public EduTrainCost getDetail(@RequestParam String costNo) {
        return eduTrainCostService.getDetail(costNo);
    }

    @PostMapping("/api/trainCost/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduTrainCost entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainCostService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat chi phi dao tao, costNo={}", entity.getCostNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat chi phi dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainCost/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String costNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainCostService.delete(costNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa chi phi dao tao, costNo={}", costNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa chi phi dao tao.");
        }
        return result;
    }

    @GetMapping("/api/trainCost/export")
    public ResponseEntity<byte[]> exportList(@RequestParam(required = false) String courseName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            return EduPlanManagerController.xlsxResponse(
                    eduTrainCostService.exportList(courseName, startDate, endDate), "trainCost.xlsx");
        } catch (Exception e) {
            log.error("Loi khi xuat Excel chi phi dao tao", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/trainCost/exportDetail")
    public ResponseEntity<byte[]> exportDetail(@RequestParam String costNo) {
        try {
            return EduPlanManagerController.xlsxResponse(eduTrainCostService.exportDetail(costNo), "trainCostDetail.xlsx");
        } catch (Exception e) {
            log.error("Loi khi xuat Excel chi tiet chi phi, costNo={}", costNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
