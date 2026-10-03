package com.ait.ar.report.controller;

import com.ait.ar.report.service.ArReportService;
import com.ait.util.AngularIndexService;
import com.ait.util.CollectionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Trung tâm báo cáo (/report/ar/viewArReportsList) - port từ ArReportCtroller.viewArReportsList
 * (Hanwha_HAE). Bên trái là cây loại báo cáo theo menuNo, bên phải mở báo cáo tương ứng (URL_JSP
 * trong REPORT_CENTER) - phần mở báo cáo do frontend xử lý.
 */
@Controller
public class ArReportController {

    private static final Logger log = LoggerFactory.getLogger(ArReportController.class);

    @Autowired
    private ArReportService arReportService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/report/ar/viewArReportsList")
    public String viewArReportsList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/report/api/arReports/menu")
    @ResponseBody
    public ResponseEntity<?> getMenu(@RequestParam(required = false) String menuNo) {
        try {
            return ResponseEntity.ok(arReportService.findMenu(menuNo));
        } catch (Exception e) {
            log.error("Lỗi khi lấy cây loại báo cáo menuNo={}: {}", menuNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }
}
