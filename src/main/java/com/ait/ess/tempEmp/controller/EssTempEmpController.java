package com.ait.ess.tempEmp.controller;

import com.ait.ess.tempEmp.dto.MonthDetailListDto;
import com.ait.ess.tempEmp.service.MonthDetailListService;
import com.ait.sy.sys.dto.DataTablesResponse;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

@Controller
@RequestMapping("/ess/tempEmp")
public class EssTempEmpController {

    @Autowired
    private MonthDetailListService monthDetailListService;

    @GetMapping("/viewMonthDetailList")
    public String viewMonthDetailList() {
        return "ess/tempEmp/viewMonthDetailList";
    }

    @GetMapping("/api/monthDetailList/list")
    @ResponseBody
    public DataTablesResponse<MonthDetailListDto> getMonthDetailList(MonthDetailListDto params) {
        return monthDetailListService.getPageList(params);
    }

    @GetMapping("/api/monthDetailList/export")
    public void exportMonthDetailList(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        monthDetailListService.exportReport(params, response);
    }
}
