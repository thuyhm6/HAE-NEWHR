package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ManageCountInfoEmpDto;
import com.ait.ess.viewDept.dto.WeeklyDeptCountDto;
import com.ait.ess.viewDept.dto.WeeklyJoinResignDto;
import com.ait.ess.viewDept.mapper.ManageCountInfoMapper;
import com.ait.ess.viewDept.mapper.WeeklyHrReportMapper;
import com.ait.ess.viewDept.service.WeeklyHrReportService;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeeklyHrReportServiceImpl implements WeeklyHrReportService {

    private static final Logger log = LoggerFactory.getLogger(WeeklyHrReportServiceImpl.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter FILE_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final int DIVISION_COL = 1;

    @Autowired
    private WeeklyHrReportMapper weeklyHrReportMapper;

    @Autowired
    private ManageCountInfoMapper manageCountInfoMapper;

    @Override
    public void exportWeeklyReport(String asOfDate, HttpServletResponse response) throws IOException {
        try {
            LocalDate refDate = (asOfDate == null || asOfDate.trim().isEmpty())
                    ? LocalDate.now()
                    : LocalDate.parse(asOfDate, DATE_FMT);
            LocalDate thisWeekMonday = refDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate thisWeekSunday = thisWeekMonday.plusDays(6);
            LocalDate lastWeekSunday = thisWeekSunday.minusDays(7);

            List<WeeklyDeptCountDto> deptCounts = weeklyHrReportMapper.selectDeptCounts(thisWeekSunday.format(DATE_FMT));

            long totalThisWeek = deptCounts.stream()
                    .mapToInt(d -> d.getEmpCount() == null ? 0 : d.getEmpCount())
                    .sum();

            ManageCountInfoEmpDto lastWeekParams = new ManageCountInfoEmpDto();
            lastWeekParams.setAsOfDate(lastWeekSunday.format(DATE_FMT));
            long totalLastWeek = manageCountInfoMapper.countTotal(lastWeekParams);

            long balance = totalThisWeek - totalLastWeek;

            List<WeeklyJoinResignDto> joinResignRows = weeklyHrReportMapper.selectJoinResignByPostGrade(
                    thisWeekMonday.format(DATE_FMT), thisWeekSunday.format(DATE_FMT));

            writeExcel(response, thisWeekMonday, thisWeekSunday, deptCounts, totalThisWeek, totalLastWeek, balance, joinResignRows);
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo nhân sự theo tuần, asOfDate={}: {}", asOfDate, e.getMessage(), e);
            throw e;
        }
    }

    private void writeExcel(HttpServletResponse response, LocalDate weekStart, LocalDate weekEnd,
                             List<WeeklyDeptCountDto> deptCounts, long totalThisWeek, long totalLastWeek, long balance,
                             List<WeeklyJoinResignDto> joinResignRows)
            throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Weekly HR Report");

        CellStyle headerStyle = createHeaderStyle(wb);
        CellStyle titleStyle = createTitleStyle(wb);
        CellStyle dataStyle = createDataStyle(wb, false, false);
        CellStyle dataCenterStyle = createDataStyle(wb, true, false);
        CellStyle sumLabelStyle = createDataStyle(wb, false, true);
        CellStyle sumCenterStyle = createDataStyle(wb, true, true);

        int deptTableMaxCol = writeManCountTable(sheet, headerStyle, dataStyle, dataCenterStyle,
                deptCounts, totalThisWeek, totalLastWeek, balance);
        int joinResignMaxCol = writeJoinResignTable(sheet, 6, headerStyle, titleStyle, dataStyle,
                dataCenterStyle, sumLabelStyle, sumCenterStyle, joinResignRows);

        int maxCol = Math.max(deptTableMaxCol, joinResignMaxCol);
        for (int c = 0; c <= maxCol; c++) {
            sheet.autoSizeColumn(c);
        }

        String filename = "BaoCaoNhanSuTheoTuan_" + weekStart.format(FILE_DATE_FMT) + "_" + weekEnd.format(FILE_DATE_FMT) + ".xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" +
                URLEncoder.encode(filename, StandardCharsets.UTF_8.name()) + "\"");
        wb.write(response.getOutputStream());
        wb.close();
    }

    /** Bảng 1: số lượng nhân viên tuần này theo phòng ban (Division / Last week / This week.. / Total / Balance) */
    private int writeManCountTable(Sheet sheet, CellStyle headerStyle, CellStyle dataStyle, CellStyle dataCenterStyle,
                                    List<WeeklyDeptCountDto> deptCounts, long totalThisWeek, long totalLastWeek, long balance) {
        int lastWeekCol = DIVISION_COL + 1;
        int firstDeptCol = lastWeekCol + 1;
        int totalCol = firstDeptCol + deptCounts.size();
        int balanceCol = totalCol + 1;

        Row row2 = sheet.createRow(1);
        Row row3 = sheet.createRow(2);
        Row row4 = sheet.createRow(3);

        setCell(row2, DIVISION_COL, "Division", headerStyle);
        setCell(row2, lastWeekCol, "Last week", headerStyle);
        setCell(row2, firstDeptCol, "This week", headerStyle);
        setCell(row2, totalCol, "Total", headerStyle);
        setCell(row2, balanceCol, "Balance", headerStyle);

        for (int i = 0; i < deptCounts.size(); i++) {
            setCell(row3, firstDeptCol + i, deptCounts.get(i).getDeptName(), headerStyle);
        }

        styleRegion(sheet, headerStyle, 1, 2, DIVISION_COL, DIVISION_COL);
        styleRegion(sheet, headerStyle, 1, 2, lastWeekCol, lastWeekCol);
        styleRegion(sheet, headerStyle, 1, 1, firstDeptCol, totalCol - 1);
        styleRegion(sheet, headerStyle, 1, 2, totalCol, totalCol);
        styleRegion(sheet, headerStyle, 1, 2, balanceCol, balanceCol);

        sheet.addMergedRegion(new CellRangeAddress(1, 2, DIVISION_COL, DIVISION_COL));
        sheet.addMergedRegion(new CellRangeAddress(1, 2, lastWeekCol, lastWeekCol));
        if (totalCol - 1 >= firstDeptCol) {
            sheet.addMergedRegion(new CellRangeAddress(1, 1, firstDeptCol, totalCol - 1));
        }
        sheet.addMergedRegion(new CellRangeAddress(1, 2, totalCol, totalCol));
        sheet.addMergedRegion(new CellRangeAddress(1, 2, balanceCol, balanceCol));

        setCell(row4, DIVISION_COL, "Regular", dataStyle);
        setCell(row4, lastWeekCol, (double) totalLastWeek, dataCenterStyle);
        for (int i = 0; i < deptCounts.size(); i++) {
            int cnt = deptCounts.get(i).getEmpCount() == null ? 0 : deptCounts.get(i).getEmpCount();
            setCell(row4, firstDeptCol + i, (double) cnt, dataCenterStyle);
        }
        setCell(row4, totalCol, (double) totalThisWeek, dataCenterStyle);
        setCell(row4, balanceCol, (double) balance, dataCenterStyle);

        return balanceCol;
    }

    /** Bảng 2: số lượng nhân viên vào làm / nghỉ việc trong tuần theo Chức vụ (POST_GRADE_NO) */
    private int writeJoinResignTable(Sheet sheet, int titleRowIdx, CellStyle headerStyle, CellStyle titleStyle,
                                      CellStyle dataStyle, CellStyle dataCenterStyle,
                                      CellStyle sumLabelStyle, CellStyle sumCenterStyle,
                                      List<WeeklyJoinResignDto> rows) {
        LinkedHashMap<String, String> gradeNames = new LinkedHashMap<>();
        Map<String, Integer> joinCounts = new LinkedHashMap<>();
        Map<String, Integer> resignCounts = new LinkedHashMap<>();
        for (WeeklyJoinResignDto r : rows) {
            gradeNames.putIfAbsent(r.getPostGradeNo(), r.getPostGradeName());
            int cnt = r.getCnt() == null ? 0 : r.getCnt();
            if ("JOIN".equals(r.getTypeCode())) {
                joinCounts.put(r.getPostGradeNo(), cnt);
            } else {
                resignCounts.put(r.getPostGradeNo(), cnt);
            }
        }
        List<String> grades = new ArrayList<>(gradeNames.keySet());

        int firstGradeCol = DIVISION_COL + 1;
        int sumCol = firstGradeCol + grades.size();

        int headerTopRow = titleRowIdx + 1;
        int headerSubRow = titleRowIdx + 2;
        int joinRow = titleRowIdx + 3;
        int resignRow = titleRowIdx + 4;
        int sumRow = titleRowIdx + 5;

        Row rTitle = sheet.createRow(titleRowIdx);
        setCell(rTitle, DIVISION_COL, "Join and Resign", titleStyle);

        Row rowTop = sheet.createRow(headerTopRow);
        Row rowSub = sheet.createRow(headerSubRow);
        setCell(rowTop, DIVISION_COL, "Division", headerStyle);
        setCell(rowTop, firstGradeCol, "Total", headerStyle);
        for (int i = 0; i < grades.size(); i++) {
            setCell(rowSub, firstGradeCol + i, gradeNames.get(grades.get(i)), headerStyle);
        }
        setCell(rowSub, sumCol, "Sum", headerStyle);

        styleRegion(sheet, headerStyle, headerTopRow, headerSubRow, DIVISION_COL, DIVISION_COL);
        styleRegion(sheet, headerStyle, headerTopRow, headerTopRow, firstGradeCol, sumCol);
        sheet.addMergedRegion(new CellRangeAddress(headerTopRow, headerSubRow, DIVISION_COL, DIVISION_COL));
        if (sumCol > firstGradeCol) {
            sheet.addMergedRegion(new CellRangeAddress(headerTopRow, headerTopRow, firstGradeCol, sumCol));
        }

        Row rJoin = sheet.createRow(joinRow);
        Row rResign = sheet.createRow(resignRow);
        Row rSum = sheet.createRow(sumRow);

        setCell(rJoin, DIVISION_COL, "Join", dataStyle);
        setCell(rResign, DIVISION_COL, "Resign", dataStyle);
        setCell(rSum, DIVISION_COL, "Sum", sumLabelStyle);

        long totalJoin = 0;
        long totalResign = 0;
        for (int i = 0; i < grades.size(); i++) {
            String grade = grades.get(i);
            int jc = joinCounts.getOrDefault(grade, 0);
            int rc = resignCounts.getOrDefault(grade, 0);
            totalJoin += jc;
            totalResign += rc;
            setCell(rJoin, firstGradeCol + i, (double) jc, dataCenterStyle);
            setCell(rResign, firstGradeCol + i, (double) rc, dataCenterStyle);
            setCell(rSum, firstGradeCol + i, (double) (jc - rc), sumCenterStyle);
        }
        setCell(rJoin, sumCol, (double) totalJoin, dataCenterStyle);
        setCell(rResign, sumCol, (double) totalResign, dataCenterStyle);
        setCell(rSum, sumCol, (double) (totalJoin - totalResign), sumCenterStyle);

        return sumCol;
    }

    private void styleRegion(Sheet sheet, CellStyle style, int firstRow, int lastRow, int firstCol, int lastCol) {
        for (int r = firstRow; r <= lastRow; r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            for (int c = firstCol; c <= lastCol; c++) {
                Cell cell = row.getCell(c);
                if (cell == null) cell = row.createCell(c);
                cell.setCellStyle(style);
            }
        }
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void setCell(Row row, int col, double value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createDataStyle(Workbook wb, boolean center, boolean bold) {
        CellStyle style = wb.createCellStyle();
        if (bold) {
            Font font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
        }
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        if (center) {
            style.setAlignment(HorizontalAlignment.CENTER);
        }
        return style;
    }
}
