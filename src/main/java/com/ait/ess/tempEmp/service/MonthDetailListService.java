package com.ait.ess.tempEmp.service;

import com.ait.ess.tempEmp.dto.MonthDetailListDto;
import com.ait.ess.tempEmp.dto.MonthDetailResultDto;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface MonthDetailListService {

    MonthDetailResultDto getMonthDetail(MonthDetailListDto params);

    void exportReport(MonthDetailListDto params, HttpServletResponse response) throws IOException;
}
