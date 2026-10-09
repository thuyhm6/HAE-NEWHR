package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordCompanyDto;
import com.ait.ar.attendanceMintenance.service.ArCardRecordCompanyService;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.util.AngularIndexService;
import com.ait.util.I18nUtil;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dữ liệu quẹt thẻ ra/vào cổng công ty (/ar/attendanceMintenance/viewArCardRecordCompany) -
 * port từ ArCardRecordCtroller#viewArCardRecordCompanyList/#insertMacRecordCompanyList của dự án cũ.
 */
@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArCardRecordCompanyController {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordCompanyController.class);

    @Autowired
    private ArCardRecordCompanyService service;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewArCardRecordCompany")
    public String viewArCardRecordCompany(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/arCardRecordCompany/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<ArCardRecordCompanyDto>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        ArCardRecordCompanyDto dto = buildFilter(keyword, deptNos, fromDate, toDate);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(service.getPageList(dto));
    }

    @PostMapping("/api/arCardRecordCompany/importFromDevice")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importFromDevice(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        if (fromDate == null || fromDate.trim().isEmpty() || toDate == null || toDate.trim().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", I18nUtil.getMessage("acr.imp.msg.selectDate"));
            return ResponseEntity.ok(err);
        }
        log.info("[arCardRecordCompany] importFromDevice fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(service.importFromDevice(fromDate.trim(), toDate.trim()));
    }

    @GetMapping("/api/arCardRecordCompany/exportExcel")
    public void exportExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            HttpServletResponse response) throws IOException {
        List<ArCardRecordCompanyDto> list = service.getExportList(buildFilter(keyword, deptNos, fromDate, toDate));

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Card_Record_Company");

            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headerKeys = {"common.stt", "common.empId", "common.empName", "common.deptName",
                                   "ess.infoApply.Rank", "acr.col.swipeDate", "acr.col.swipeTime", "acr.col.doorType"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headerKeys.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(I18nUtil.getMessage(headerKeys[i]).trim());
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (ArCardRecordCompanyDto item : list) {
                Row row = sheet.createRow(rowIdx);
                row.createCell(0).setCellValue(rowIdx);
                row.createCell(1).setCellValue(nvl(item.getCardNo()));
                row.createCell(2).setCellValue(nvl(item.getLocalName()));
                row.createCell(3).setCellValue(nvl(item.getDeptName()));
                row.createCell(4).setCellValue(nvl(item.getPostGradeName()));
                row.createCell(5).setCellValue(nvl(item.getRDate()));
                row.createCell(6).setCellValue(nvl(item.getRTime()));
                row.createCell(7).setCellValue(nvl(item.getDoorType()));
                rowIdx++;
            }

            for (int i = 0; i < headerKeys.length; i++) {
                sheet.autoSizeColumn(i);
            }

            String fileName = URLEncoder.encode("card_record_company.xlsx", StandardCharsets.UTF_8.name());
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);
            wb.write(response.getOutputStream());
        } catch (Exception e) {
            log.error("[arCardRecordCompany] exportExcel error", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private ArCardRecordCompanyDto buildFilter(String keyword, String deptNos, String fromDate, String toDate) {
        ArCardRecordCompanyDto dto = new ArCardRecordCompanyDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        return dto;
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}
