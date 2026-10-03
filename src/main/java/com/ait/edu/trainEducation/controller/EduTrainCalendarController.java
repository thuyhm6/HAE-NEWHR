package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduCalendarDetail;
import com.ait.edu.trainEducation.model.EduCalendarItem;
import com.ait.edu.trainEducation.service.EduTrainCalendarService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

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
 * Lịch đào tạo (/edu/trainfile/trainCalendar) và lịch đào tạo cá nhân
 * (/edu/trainfile/personalTrainCalendar) - port từ TrainFileCtroller
 * (Hanwha_HTSV): lưới tháng, mỗi ngày liệt kê kế hoạch có lịch học; bấm vào
 * kế hoạch để xem chi tiết + lịch học.
 */
@Controller
@RequestMapping("/edu")
public class EduTrainCalendarController {

    @Autowired
    private EduTrainCalendarService eduTrainCalendarService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping({ "/trainfile/trainCalendar", "/trainfile/personalTrainCalendar" })
    public String viewTrainCalendar(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/trainCalendar/month")
    @ResponseBody
    public ResponseEntity<?> getMonth(@RequestParam int year, @RequestParam int month) {
        try {
            List<EduCalendarItem> list = eduTrainCalendarService.findMonthItems(year, month);
            return ResponseEntity.ok(list);
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(error(e));
        }
    }

    /** Lịch cá nhân - personalTrainCalendar?actionType=personal bản gốc. */
    @GetMapping("/api/trainCalendar/personalMonth")
    @ResponseBody
    public ResponseEntity<?> getPersonalMonth(@RequestParam int year, @RequestParam int month) {
        try {
            List<EduCalendarItem> list = eduTrainCalendarService.findPersonalMonthItems(year, month);
            return ResponseEntity.ok(list);
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(error(e));
        }
    }

    @GetMapping("/api/trainCalendar/detail")
    @ResponseBody
    public ResponseEntity<?> getDetail(@RequestParam String planNo) {
        try {
            EduCalendarDetail detail = eduTrainCalendarService.getDetail(planNo);
            return ResponseEntity.ok(detail);
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(error(e));
        }
    }

    private static Map<String, Object> error(BusinessException e) {
        Map<String, Object> result = new HashMap<>();
        EduCourseManagerController.putError(result, e);
        return result;
    }
}
