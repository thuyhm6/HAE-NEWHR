package com.ait.ess.tempEmp.controller;

import com.ait.ess.tempEmp.dto.MonthDetailListDto;
import com.ait.ess.tempEmp.service.MonthDetailListService;
import com.ait.util.AngularIndexService;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.Collections;

@Controller
@RequestMapping("/ess/tempEmp")
public class EssTempEmpController {

    @Autowired
    private MonthDetailListService monthDetailListService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewMonthDetailList")
    public String viewMonthDetailList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    /** Lịch tháng + danh sách chi tiết chấm công (không phân trang, giống bản gốc Hanwha_HAE). */
    @GetMapping("/api/monthDetailList/list")
    @ResponseBody
    public ResponseEntity<?> getMonthDetailList(MonthDetailListDto params) {
        try {
            return ResponseEntity.ok(monthDetailListService.getMonthDetail(params));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/api/monthDetailList/export")
    public void exportMonthDetailList(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        monthDetailListService.exportReport(params, response);
    }
}
