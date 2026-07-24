package com.ait.ess.tempEmp.service.impl;

import com.ait.ess.tempEmp.dto.MonthDetailListDto;
import com.ait.ess.tempEmp.mapper.MonthDetailListMapper;
import com.ait.ess.tempEmp.service.MonthDetailListService;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.util.I18nUtil;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.util.CellReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.expression.MapAccessor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MonthDetailListServiceImpl implements MonthDetailListService {

    private static final Logger log = LoggerFactory.getLogger(MonthDetailListServiceImpl.class);

    /** Các trường kết quả có kiểu chuỗi/ngày - khi NULL phải để trống ô, không mặc định 0 như trường số. */
    private static final Set<String> STRING_FIELDS = buildStringFields();

    /** Nhận diện placeholder tổng cột kiểu {@code $[SUM(J8:U8)]} trong file mẫu. */
    private static final Pattern SUM_PATTERN = Pattern.compile("^\\$\\[SUM\\(([A-Za-z]+)\\d+:([A-Za-z]+)\\d+\\)]$");

    /** Nhận diện các cột ngày dạng DATE_&lt;số&gt;/DATE_IN_&lt;số&gt;/DATE_OUT_&lt;số&gt; (luôn là chuỗi). */
    private static final Pattern DATE_FIELD_PATTERN = Pattern.compile("^DATE(_IN|_OUT)?_\\d+$");

    @Autowired
    private MonthDetailListMapper mapper;

    @Override
    public DataTablesResponse<MonthDetailListDto> getPageList(MonthDetailListDto params) {
        try {
            int total = mapper.countList(params);
            List<MonthDetailListDto> list = mapper.selectListPage(params);
            return new DataTablesResponse<>(params.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách chi tiết chấm công tháng: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void exportReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        log.info("Yêu cầu xuất báo cáo chấm công tháng: reportType={}, month={}, year={}, reportYear={}",
                params.getReportType(), params.getMonth(), params.getYear(), params.getReportYear());
        if ("314".equals(params.getReportType())) {
            exportSalaryReport(params, response);
            return;
        }
        if ("3294".equals(params.getReportType())) {
            exportBonus13thReport(params, response);
            return;
        }
        if ("3293".equals(params.getReportType())) {
            exportReferralBonusReport(params, response);
            return;
        }
        if ("3292".equals(params.getReportType())) {
            exportWorkDurationReport(params, response);
            return;
        }
        if ("3291".equals(params.getReportType())) {
            exportWorkOtPrintReport(params, response);
            return;
        }
        if ("3296".equals(params.getReportType())) {
            exportDiligenceReport(params, response);
            return;
        }
        if ("306".equals(params.getReportType())) {
            exportPrintTotalOtReport(params, response);
            return;
        }
        if ("3277".equals(params.getReportType())) {
            exportMonthAttPrintReport(params, response);
            return;
        }
        if ("3286".equals(params.getReportType())) {
            exportMonthOtOverReport(params, response);
            return;
        }
        if ("3289".equals(params.getReportType())) {
            exportMonthAttTotalDayReport(params, response);
            return;
        }
        // Câu lệnh truy vấn và file mẫu cho các loại báo cáo còn lại sẽ được bổ sung thủ công sau
        exportPendingReport(params, response);
    }

    /**
     * Xuất báo cáo "Công tính lương": điền dữ liệu vào file mẫu templates/314.xls.
     * File mẫu dùng cú pháp {@code <jx:forEach items="${viewMonthDetailList}" var="reports" varStatus="i"> ... </jx:forEach>}
     * bao quanh 1 dòng mẫu chứa các biểu thức {@code ${reports.FIELD}} (có thể kèm phép toán) - dòng này
     * được nhân bản cho từng nhân viên trong kết quả truy vấn.
     */
    private void exportSalaryReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectSalaryReport(params);

            ClassPathResource resource = new ClassPathResource("templates/314.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachBlock(sheet, rows);
                fillSalaryHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "314_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công tính lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo "Công tính thưởng tháng 13": điền dữ liệu vào file mẫu templates/3294.xls.
     * Cùng cơ chế {@code <jx:forEach>} như báo cáo công tính lương, nhưng dữ liệu tổng hợp theo năm
     * (12 cột/tháng cho mỗi chỉ số) và có thêm các ô tổng dạng {@code $[SUM(J8:U8)]}.
     * Báo cáo này tính theo năm nên lấy năm từ dropdown "Năm" (reportYear), không dùng năm trong ô "Tháng".
     */
    private void exportBonus13thReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            if (params.getReportYear() != null && !params.getReportYear().isBlank()) {
                params.setYear(params.getReportYear());
            }
            List<Map<String, Object>> rows = mapper.selectBonus13thReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3294.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachBlock(sheet, rows);
                fillBonus13thHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3294_" + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công tính thưởng tháng 13: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo "Công tính thưởng giới thiệu 01.11.2025": điền dữ liệu vào file mẫu templates/3293.xlsx (2 sheet).
     * Sheet 0 ("01,11,2025" - nhân viên mới) dùng ngày cố định, không phụ thuộc Tháng/Năm trên giao diện.
     * Sheet 1 ("CHUYÊN CẦN") tham số hoá theo Tháng (giá trị MMYYYY từ ô Tháng, giống báo cáo Công tính lương).
     */
    private void exportReferralBonusReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> newEmpRows = mapper.selectReferralBonusNewEmpReport(params);
            List<Map<String, Object>> diligenceRows = mapper.selectReferralBonusDiligenceReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3293.xlsx");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                fillForEachBlock(workbook.getSheetAt(0), newEmpRows);
                fillForEachBlock(workbook.getSheetAt(1), diligenceRows);

                writeWorkbook(workbook, response, "3293_" + params.getMonth() + params.getYear() + ".xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công tính thưởng giới thiệu: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo "Công tính chuyên cần 01.03.2026": điền dữ liệu vào file mẫu templates/3296.xlsx (2 sheet).
     * Sheet 0 ("CHUYÊN CẦN") tham số hoá theo Tháng (ô Tháng trên giao diện, giống báo cáo Công tính lương).
     * Sheet 1 ("01.03.2026") dùng ngày cố định theo DATE_STARTED của nhân viên mới, không phụ thuộc Tháng/Năm.
     */
    private void exportDiligenceReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> continuingRows = mapper.selectDiligenceContinuingReport(params);
            List<Map<String, Object>> newEmpRows = mapper.selectDiligenceNewEmpReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3296.xlsx");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                fillForEachBlock(workbook.getSheetAt(0), continuingRows);
                fillForEachBlock(workbook.getSheetAt(1), newEmpRows);

                writeWorkbook(workbook, response, "3296_" + params.getMonth() + params.getYear() + ".xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công tính chuyên cần: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo "Công thời lượng đi làm trong tháng": điền dữ liệu vào file mẫu templates/3292.xls.
     * Cùng cơ chế {@code <jx:forEach>} như báo cáo công tính lương, tham số hoá theo Tháng (ô Tháng trên giao diện).
     */
    private void exportWorkDurationReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectWorkDurationReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3292.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachBlock(sheet, rows);
                fillWorkDurationHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3292_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công thời lượng đi làm trong tháng: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo "Công + Tăng ca tháng (Print)": điền dữ liệu vào file mẫu templates/3291.xls.
     * Mỗi nhân viên ứng với 3 dòng dữ liệu (TYPE = 'Công'/'Tăng ca ngày'/'Tăng ca đêm'), file mẫu có 3 khối
     * {@code <jx:if test="${reports.TYPE == '...'}">} lồng trong {@code <jx:forEach>} - mỗi dòng dữ liệu chỉ
     * dùng đúng 1 khối tương ứng với TYPE của nó (xem {@link #fillForEachWithIfBlocks}).
     */
    private void exportWorkOtPrintReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectWorkOtPrintReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3291.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachWithIfBlocks(sheet, rows);
                fillWorkOtPrintHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3291_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo công + tăng ca tháng (print): {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo nhanh "(Print)Total OT": điền dữ liệu vào file mẫu templates/306.xls.
     * Cùng cấu trúc 3 khối {@code <jx:if>} như báo cáo Công + Tăng ca tháng (3291), có thêm các cột
     * ngày công/đi muộn về sớm chi tiết hơn (WORK_SCHEDULE_DAYS, LATE_PRO_ARRIVE_HOURS...).
     */
    private void exportPrintTotalOtReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectPrintTotalOtReport(params);

            ClassPathResource resource = new ClassPathResource("templates/306.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachWithIfBlocks(sheet, rows);
                fillWorkOtPrintHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "306_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo (Print)Total OT: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo nhanh "Month attendance (Print)": điền dữ liệu vào file mẫu templates/3277.xls.
     * Cùng cấu trúc 3 khối {@code <jx:if>} như 306/3291, nhánh "Công" có thêm nhiều cột chi tiết loại
     * nghỉ phép (SICK_LEAVE_DAYS, ANNUAL_LEAVE_DAYS, COVID_LEAVE_DAYS...).
     */
    private void exportMonthAttPrintReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectMonthAttPrintReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3277.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachWithIfBlocks(sheet, rows);
                fillWorkOtPrintHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3277_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo Month attendance (Print): {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo nhanh "Month OT Over": điền dữ liệu vào file mẫu templates/3286.xls.
     * Không có {@code <jx:if>} (1 dòng mẫu/nhân viên), dùng {@link #fillForEachBlock} như báo cáo lương.
     */
    private void exportMonthOtOverReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectMonthOtOverReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3286.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachBlock(sheet, rows);
                fillMonthOtOverHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3286_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo Month OT Over: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất báo cáo nhanh "Month Att Total Day": điền dữ liệu vào file mẫu templates/3289.xls.
     * Không có {@code <jx:if>} (1 dòng mẫu/nhân viên), dùng {@link #fillForEachBlock}.
     */
    private void exportMonthAttTotalDayReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            List<Map<String, Object>> rows = mapper.selectMonthAttTotalDayReport(params);

            ClassPathResource resource = new ClassPathResource("templates/3289.xls");
            try (InputStream is = resource.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                fillForEachBlock(sheet, rows);
                fillMonthAttTotalDayHeaderPlaceholders(sheet, params);

                writeWorkbook(workbook, response, "3289_" + params.getMonth() + params.getYear() + ".xls");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo Month Att Total Day: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void writeWorkbook(Workbook workbook, HttpServletResponse response, String fileName) throws IOException {
        writeWorkbook(workbook, response, fileName, "application/vnd.ms-excel");
    }

    private void writeWorkbook(Workbook workbook, HttpServletResponse response, String fileName, String contentType) throws IOException {
        response.setContentType(contentType);
        response.setHeader("Content-Disposition", "attachment; filename=\"" +
                URLEncoder.encode(fileName, StandardCharsets.UTF_8) + "\"");
        workbook.write(response.getOutputStream());
    }

    /**
     * Engine dùng chung cho mọi template dạng {@code <jx:forEach>...</jx:forEach>}: tự tìm block, nhân bản
     * dòng mẫu cho từng dòng dữ liệu, tính các biểu thức {@code ${reports.FIELD}} bằng SpEL và các ô tổng
     * {@code $[SUM(colStart:colEnd)]} bằng cách cộng lại các cột đã tính trong cùng dòng.
     */
    private void fillForEachBlock(Sheet sheet, List<Map<String, Object>> rows) {
        DataFormatter fmt = new DataFormatter();
        int[] bounds = findForEachBounds(sheet, fmt);
        int openTagRow = bounds[0];
        int closeTagRow = bounds[1];
        if (openTagRow < 0 || closeTagRow < 0 || closeTagRow <= openTagRow + 1) {
            log.warn("Không tìm thấy block dữ liệu <jx:forEach> hợp lệ trong file mẫu");
            return;
        }

        Row templateRow = sheet.getRow(openTagRow + 1);
        ExpressionParser parser = new SpelExpressionParser();
        RowTemplate rt = parseRowTemplate(templateRow, parser, fmt);

        int blockSize = closeTagRow - openTagRow + 1;
        int n = rows.size();
        int shiftAmount = n - blockSize;
        if (shiftAmount != 0 && closeTagRow + 1 <= sheet.getLastRowNum()) {
            sheet.shiftRows(closeTagRow + 1, sheet.getLastRowNum(), shiftAmount);
        }

        for (int i = 0; i < n; i++) {
            Map<String, Object> reportRow = safeRow(rows.get(i));
            Row targetRow = sheet.getRow(openTagRow + i);
            if (targetRow == null) {
                targetRow = sheet.createRow(openTagRow + i);
            }
            evaluateAndWriteRow(targetRow, rt, reportRow, i);
        }
    }

    /**
     * Engine cho template có nhiều khối {@code <jx:if test="${reports.FIELD == 'VALUE'}">...</jx:if>} lồng
     * trong 1 {@code <jx:forEach>} (VD báo cáo Công + Tăng ca): mỗi dòng dữ liệu có 1 trường phân loại
     * (VD TYPE) quyết định dùng dòng mẫu nào trong số nhiều dòng mẫu khai báo sẵn, các khối còn lại bị bỏ qua.
     */
    private void fillForEachWithIfBlocks(Sheet sheet, List<Map<String, Object>> rows) {
        DataFormatter fmt = new DataFormatter();
        int[] bounds = findForEachBounds(sheet, fmt);
        int openTagRow = bounds[0];
        int closeTagRow = bounds[1];
        if (openTagRow < 0 || closeTagRow < 0 || closeTagRow <= openTagRow + 1) {
            log.warn("Không tìm thấy block dữ liệu <jx:forEach> hợp lệ trong file mẫu");
            return;
        }

        ExpressionParser parser = new SpelExpressionParser();
        Pattern ifPattern = Pattern.compile("^<jx:if test=\"\\$\\{reports\\.(\\w+) == '([^']*)'\\}\">$");
        List<IfBranch> branches = new ArrayList<>();
        int r = openTagRow + 1;
        while (r < closeTagRow) {
            Row tagRow = sheet.getRow(r);
            String tagText = tagRow == null ? "" : fmt.formatCellValue(tagRow.getCell(0));
            Matcher m = ifPattern.matcher(tagText == null ? "" : tagText.trim());
            if (m.matches()) {
                int templateRowIdx = r + 1;
                int endIfRow = templateRowIdx + 1;
                while (endIfRow < closeTagRow) {
                    Row endRow = sheet.getRow(endIfRow);
                    String endText = endRow == null ? "" : fmt.formatCellValue(endRow.getCell(0));
                    if ("</jx:if>".equals(endText == null ? "" : endText.trim())) {
                        break;
                    }
                    endIfRow++;
                }
                Row templateRow = sheet.getRow(templateRowIdx);
                if (templateRow != null) {
                    branches.add(new IfBranch(m.group(1), m.group(2), parseRowTemplate(templateRow, parser, fmt)));
                }
                r = endIfRow + 1;
            } else {
                r++;
            }
        }
        if (branches.isEmpty()) {
            log.warn("Không tìm thấy khối <jx:if> nào trong block <jx:forEach> của file mẫu");
            return;
        }

        int blockSize = closeTagRow - openTagRow + 1;
        int n = rows.size();
        int shiftAmount = n - blockSize;
        if (shiftAmount != 0 && closeTagRow + 1 <= sheet.getLastRowNum()) {
            sheet.shiftRows(closeTagRow + 1, sheet.getLastRowNum(), shiftAmount);
        }

        for (int i = 0; i < n; i++) {
            Map<String, Object> reportRow = safeRow(rows.get(i));
            IfBranch matched = null;
            for (IfBranch branch : branches) {
                if (branch.value.equals(reportRow.get(branch.field))) {
                    matched = branch;
                    break;
                }
            }

            int targetIdx = openTagRow + i;
            Row existing = sheet.getRow(targetIdx);
            if (existing != null) {
                // Xoá sạch dòng cũ (có thể đang mang style/nội dung của 1 khối <jx:if> khác) trước khi ghi đè,
                // tránh lẫn dữ liệu giữa các loại dòng khác nhau (Công / Tăng ca ngày / Tăng ca đêm).
                sheet.removeRow(existing);
            }
            Row targetRow = sheet.createRow(targetIdx);
            if (matched == null) {
                log.warn("Không tìm thấy khối <jx:if> khớp với dữ liệu dòng thứ {} (TYPE={})", i, reportRow.get("TYPE"));
                continue;
            }
            evaluateAndWriteRow(targetRow, matched.rowTemplate, reportRow, i);
        }

        // Khi số dòng dữ liệu ít hơn số dòng vật lý gốc của block (do block gốc gồm nhiều dòng
        // <jx:if>/mẫu/</jx:if> cho các nhánh không dùng tới), phần dòng scaffolding còn sót lại
        // (tag <jx:if>, </jx:if>, </jx:forEach>...) nằm ngoài shiftRows nên phải xoá thủ công.
        for (int idx = openTagRow + n; idx <= closeTagRow; idx++) {
            Row leftover = sheet.getRow(idx);
            if (leftover != null) {
                sheet.removeRow(leftover);
            }
        }
    }

    /** Tìm dòng chứa {@code <jx:forEach>} và {@code </jx:forEach>} trong sheet. */
    private int[] findForEachBounds(Sheet sheet, DataFormatter fmt) {
        int openTagRow = -1;
        int closeTagRow = -1;
        for (int r = 0; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) {
                continue;
            }
            for (Cell cell : row) {
                String v = fmt.formatCellValue(cell);
                if (v.contains("<jx:forEach")) {
                    openTagRow = r;
                }
                if (v.contains("</jx:forEach>")) {
                    closeTagRow = r;
                }
            }
        }
        return new int[]{openTagRow, closeTagRow};
    }

    /** Phân tích 1 dòng mẫu: lấy style + biểu thức SpEL {@code ${reports.FIELD}} hoặc tổng {@code $[SUM(a:b)]} từng cột. */
    private RowTemplate parseRowTemplate(Row templateRow, ExpressionParser parser, DataFormatter fmt) {
        int lastCol = templateRow.getLastCellNum();
        Expression[] expressions = new Expression[lastCol];
        CellStyle[] cellStyles = new CellStyle[lastCol];
        int[] sumStartCol = new int[lastCol];
        int[] sumEndCol = new int[lastCol];
        for (int c = 0; c < lastCol; c++) {
            sumStartCol[c] = -1;
            sumEndCol[c] = -1;
            Cell cell = templateRow.getCell(c);
            if (cell == null) {
                continue;
            }
            cellStyles[c] = cell.getCellStyle();
            String text = fmt.formatCellValue(cell);
            if (text == null) {
                continue;
            }
            Matcher sumMatcher = SUM_PATTERN.matcher(text);
            if (sumMatcher.matches()) {
                sumStartCol[c] = CellReference.convertColStringToIndex(sumMatcher.group(1));
                sumEndCol[c] = CellReference.convertColStringToIndex(sumMatcher.group(2));
            } else if (text.startsWith("${") && text.endsWith("}")) {
                String expr = text.substring(2, text.length() - 1)
                        .replace("i.index", "#i.index")
                        .replace("reports.", "#reports.");
                try {
                    expressions[c] = parser.parseExpression(expr);
                } catch (Exception e) {
                    log.warn("Không parse được biểu thức cột {} trong file mẫu: {}", c, text, e);
                }
            }
        }
        return new RowTemplate(lastCol, expressions, cellStyles, sumStartCol, sumEndCol);
    }

    /** Tính giá trị từng cột (SpEL + tổng SUM) của 1 dòng mẫu đã phân tích rồi ghi vào dòng đích. */
    private void evaluateAndWriteRow(Row targetRow, RowTemplate rt, Map<String, Object> reportRow, int loopIndex) {
        StandardEvaluationContext ctx = new StandardEvaluationContext();
        ctx.addPropertyAccessor(new MapAccessor());
        ctx.setVariable("reports", reportRow);
        ctx.setVariable("i", new LoopIndexHolder(loopIndex));

        Object[] rowValues = new Object[rt.lastCol];
        for (int c = 0; c < rt.lastCol; c++) {
            if (rt.expressions[c] == null) {
                continue;
            }
            try {
                rowValues[c] = rt.expressions[c].getValue(ctx);
            } catch (Exception e) {
                rowValues[c] = null;
            }
        }
        for (int c = 0; c < rt.lastCol; c++) {
            if (rt.sumStartCol[c] < 0) {
                continue;
            }
            double sum = 0;
            for (int s = rt.sumStartCol[c]; s <= rt.sumEndCol[c]; s++) {
                if (rowValues[s] instanceof Number) {
                    sum += ((Number) rowValues[s]).doubleValue();
                }
            }
            rowValues[c] = sum;
        }

        for (int c = 0; c < rt.lastCol; c++) {
            if (rt.cellStyles[c] == null) {
                continue;
            }
            Cell cell = targetRow.getCell(c);
            if (cell == null) {
                cell = targetRow.createCell(c);
            }
            cell.setCellStyle(rt.cellStyles[c]);
            if (rt.expressions[c] == null && rt.sumStartCol[c] < 0) {
                continue;
            }
            setCellObjectValue(cell, rowValues[c]);
        }
    }

    private static class RowTemplate {
        final int lastCol;
        final Expression[] expressions;
        final CellStyle[] cellStyles;
        final int[] sumStartCol;
        final int[] sumEndCol;

        RowTemplate(int lastCol, Expression[] expressions, CellStyle[] cellStyles, int[] sumStartCol, int[] sumEndCol) {
            this.lastCol = lastCol;
            this.expressions = expressions;
            this.cellStyles = cellStyles;
            this.sumStartCol = sumStartCol;
            this.sumEndCol = sumEndCol;
        }
    }

    private static class IfBranch {
        final String field;
        final String value;
        final RowTemplate rowTemplate;

        IfBranch(String field, String value, RowTemplate rowTemplate) {
            this.field = field;
            this.value = value;
            this.rowTemplate = rowTemplate;
        }
    }

    /**
     * Điền các ô placeholder ở phần tiêu đề (không lặp theo dòng). Đối chiếu với báo cáo mẫu đã xuất
     * thực tế (314_out.xls) cho thấy tên biến trong file mẫu bị đặt ngược: {@code ${year}} thực chất
     * nhận giá trị tháng, còn {@code ${month}}/{@code ${month-1}} nhận giá trị năm/năm-1.
     */
    private void fillSalaryHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        String month = params.getMonth();
        String year = params.getYear();
        String prevYear = year;
        try {
            prevYear = String.valueOf(Integer.parseInt(year) - 1);
        } catch (Exception ignored) {
            // Giữ nguyên year nếu không parse được
        }
        String curYearDate = "20/01/" + year;
        String prevYearDate = "21/12/" + prevYear;

        setCellIfExists(sheet, 4, 3, month);          // D5: Tháng
        setCellIfExists(sheet, 4, 16, curYearDate);   // Q5
        setCellIfExists(sheet, 4, 20, prevYearDate);  // U5
        setCellIfExists(sheet, 4, 29, curYearDate);   // AD5
        setCellIfExists(sheet, 4, 33, prevYearDate);  // AH5
    }

    /** Thay token {@code ${item.YEAR}} trong tiêu đề báo cáo bằng năm đang xuất. */
    private void fillBonus13thHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        replaceTextInCell(sheet, 2, 0, "${item.YEAR}", params.getYear());
    }

    /** Thay các token {@code ${month}}/{@code ${year}} ở ô tiêu đề "Month: ${month}-${year}". */
    private void fillWorkDurationHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        replaceTextInCell(sheet, 4, 3, "${month}", params.getMonth());
        replaceTextInCell(sheet, 4, 3, "${year}", params.getYear());
    }

    /**
     * Thay các token {@code ${month}}/{@code ${year}} ở 3 ô tiêu đề: "Month ${month}", "year ${year}"
     * và dải ngày "01/${month}/${year} ~ 31/${month}/${year}".
     */
    private void fillWorkOtPrintHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        replaceTextInCell(sheet, 4, 3, "${month}", params.getMonth());
        replaceTextInCell(sheet, 4, 5, "${year}", params.getYear());
        replaceTextInCell(sheet, 5, 2, "${month}", params.getMonth());
        replaceTextInCell(sheet, 5, 2, "${year}", params.getYear());
        replaceTextInCell(sheet, 5, 4, "${month}", params.getMonth());
        replaceTextInCell(sheet, 5, 4, "${year}", params.getYear());
    }

    /**
     * Thay token tiêu đề cho báo cáo "Month OT Over": tên biến trong file mẫu bị đặt ngược giống báo cáo
     * Công tính lương - ô {@code ${year}} thực chất cần nhận giá trị Tháng, ô {@code ${month}} cần nhận giá
     * trị Năm. Dải ngày "21/${year - 1}/${month} ~ 20/${year}/${month}" hiển thị kỳ chấm công từ ngày 21
     * tháng trước đến ngày 20 tháng hiện tại, nên token {@code ${year - 1}} cần nhận giá trị (Tháng - 1).
     */
    private void fillMonthOtOverHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        String month = params.getMonth();
        String year = params.getYear();
        String prevMonth = month;
        try {
            int m = Integer.parseInt(month);
            prevMonth = String.format("%02d", m == 1 ? 12 : m - 1);
        } catch (Exception ignored) {
            // Giữ nguyên month nếu không parse được
        }

        replaceTextInCell(sheet, 4, 3, "${year}", month);
        replaceTextInCell(sheet, 4, 5, "${month}", year);

        replaceTextInCell(sheet, 5, 2, "${year - 1}", prevMonth);
        replaceTextInCell(sheet, 5, 2, "${month}", year);
        replaceTextInCell(sheet, 5, 4, "${year}", month);
        replaceTextInCell(sheet, 5, 4, "${month}", year);
    }

    /**
     * Thay token tiêu đề cho báo cáo "Month Att Total Day": tên biến bị đặt ngược giống 314/3286 - ô
     * {@code ${year}} (ngay sau nhãn "Month") thực chất cần nhận giá trị Tháng.
     */
    private void fillMonthAttTotalDayHeaderPlaceholders(Sheet sheet, MonthDetailListDto params) {
        replaceTextInCell(sheet, 4, 3, "${year}", params.getMonth());
    }

    private void setCellIfExists(Sheet sheet, int rowIdx, int colIdx, String value) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) {
            return;
        }
        Cell cell = row.getCell(colIdx);
        if (cell == null) {
            cell = row.createCell(colIdx);
        }
        cell.setCellValue(value);
    }

    private void replaceTextInCell(Sheet sheet, int rowIdx, int colIdx, String token, String value) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) {
            return;
        }
        Cell cell = row.getCell(colIdx);
        if (cell == null) {
            return;
        }
        String text = new DataFormatter().formatCellValue(cell);
        if (text != null && text.contains(token)) {
            cell.setCellValue(text.replace(token, value == null ? "" : value));
        }
    }

    private void setCellObjectValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value.toString());
        }
    }

    /**
     * Bọc dữ liệu 1 dòng: trường số chưa có trong kết quả truy vấn (chưa bổ sung câu lệnh) mặc định 0
     * để biểu thức tính toán trong template không lỗi; trường chuỗi/ngày vẫn giữ nguyên null để hiển thị trống.
     */
    private Map<String, Object> safeRow(Map<String, Object> row) {
        return new HashMap<>(row) {
            @Override
            public boolean containsKey(Object key) {
                // Luôn báo "có" để MapAccessor (SpEL) cho phép đọc property, kể cả trường chưa có
                // trong kết quả truy vấn - get() bên dưới sẽ tự quyết định giá trị mặc định.
                return true;
            }

            @Override
            public Object get(Object key) {
                if (!super.containsKey(key)) {
                    return isStringField(key) ? null : 0;
                }
                return super.get(key);
            }
        };
    }

    /**
     * Trường chuỗi/ngày cần để trống khi thiếu, thay vì mặc định 0. Ngoài danh sách tên cố định
     * ({@link #STRING_FIELDS}), các cột dạng {@code DATE_<số>}, {@code DATE_IN_<số>}, {@code DATE_OUT_<số>}
     * (ngày+tháng ghép, VD DATE_111, DATE_IN_3006...) cũng luôn là chuỗi - dùng regex vì số lượng hậu tố
     * quá nhiều để liệt kê hết (báo cáo Công tính thưởng giới thiệu có cột theo từng ngày từ 11/2025-06/2026).
     */
    private boolean isStringField(Object key) {
        if (!(key instanceof String)) {
            return false;
        }
        String name = (String) key;
        return STRING_FIELDS.contains(name) || DATE_FIELD_PATTERN.matcher(name).matches();
    }

    private static Set<String> buildStringFields() {
        Set<String> fields = new HashSet<>();
        fields.add("EMPID");
        fields.add("PERSON_ID");
        fields.add("LOCAL_NAME");
        fields.add("DEPTNO");
        fields.add("DEPT_NAME");
        fields.add("DEPT_TYPE");
        fields.add("POSITION_NAME");
        fields.add("DATE_STARTED");
        fields.add("END_PROBATION_DATE");
        fields.add("DATE_LEFT");
        fields.add("EMPLOYEE_TYPE");
        fields.add("FROM_TIME");
        fields.add("TO_TIME");
        fields.add("YEAR");
        fields.add("EMP_TYPE_CODE");
        fields.add("EMP_TYPE_NAME");
        fields.add("POST_FAMILY");
        fields.add("POST_FAMILY_NAME");
        fields.add("POST_GRADE_NO");
        fields.add("POST_GRADE_NAME");
        fields.add("POSITION_NO");
        fields.add("DATE_STARTED1");
        fields.add("DATE_STARTED2");
        fields.add("DATE_STARTED3");
        fields.add("DATE_STARTED4");
        for (int d = 1; d <= 31; d++) {
            fields.add("DATE_" + d);
            fields.add("DAY_OT_" + d);
            fields.add("NIGHT_OT_" + d);
        }
        return fields;
    }

    private static class LoopIndexHolder {
        private final int index;

        LoopIndexHolder(int index) {
            this.index = index;
        }

        public int getIndex() {
            return index;
        }
    }

    private void exportPendingReport(MonthDetailListDto params, HttpServletResponse response) throws IOException {
        try {
            String message = I18nUtil.getMessage("ess.viewMonthDetailList.msg.exportPending",
                    new Object[]{params.getReportType()});
            byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
            response.setContentType("text/plain;charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=\"thong_bao_bao_cao.txt\"");
            response.setContentLength(bytes.length);
            response.getOutputStream().write(bytes);
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo chấm công tháng: {}", e.getMessage(), e);
            throw e;
        }
    }
}
