package com.ait.ess.viewDept.service;

import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface WeeklyHrReportService {

    void exportWeeklyReport(String asOfDate, HttpServletResponse response) throws IOException;
}
