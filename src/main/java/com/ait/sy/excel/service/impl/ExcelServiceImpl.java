package com.ait.sy.excel.service.impl;

import com.ait.sy.excel.mapper.ExcelMapper;
import com.ait.sy.excel.service.ExcelService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ExcelServiceImpl implements ExcelService {

    private static final Logger log = LoggerFactory.getLogger(ExcelServiceImpl.class);

    @Autowired
    private ExcelMapper mapper;

    @Override
    public Workbook buildTemplate(List<Map<String, Object>> shiftList, List<Map<String, Object>> typeList,
            String templateName) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + templateName + ".xlsx");
            XSSFWorkbook wb = new XSSFWorkbook(resource.getInputStream());
            List<Map<String, Object>> safeTypeList = typeList == null ? new ArrayList<>() : typeList;
            List<Map<String, Object>> safeShiftList = shiftList == null ? new ArrayList<>() : shiftList;

            XSSFSheet codeSheet = wb.getSheet("TemplateCode");
            if (codeSheet != null) {
                for (int i = codeSheet.getLastRowNum(); i >= 1; i--) {
                    Row row = codeSheet.getRow(i);
                    if (row != null) {
                        codeSheet.removeRow(row);
                    }
                }

                int maxRows = Math.max(safeTypeList.size(), safeShiftList.size());
                for (int i = 0; i < maxRows; i++) {
                    Row row = codeSheet.createRow(i + 1);
                    if (i < safeTypeList.size()) {
                        row.createCell(0).setCellValue(str(safeTypeList.get(i).get("name")));
                        row.createCell(1).setCellValue(str(safeTypeList.get(i).get("code")));
                    }
                    if (i < safeShiftList.size()) {
                        row.createCell(2).setCellValue(str(safeShiftList.get(i).get("nameVi")));
                        row.createCell(3).setCellValue(str(safeShiftList.get(i).get("shiftNo")));
                    }
                }
            }

            return wb;
        } catch (IOException e) {
            log.error("Failed to load template from classpath templateName={}", templateName, e);
            throw new RuntimeException("Khong the doc file mau " + templateName + ".xlsx.", e);
        }
    }

    @Override
    @Transactional
    public List<String> importTemplate(String templateName, MultipartFile file) throws IOException {
        String normalizedTemplateName = normalizeTemplateName(templateName);
        if (normalizedTemplateName == null) {
            throw new IllegalArgumentException("templateName is required.");
        }

        if ("AR_SCHEDULE_HTSV_Template".equalsIgnoreCase(normalizedTemplateName)) {
            return importScheduleHtsvTemplate(file);
        } else if ("AttendanceApply_add_Template".equalsIgnoreCase(normalizedTemplateName)) {
            return importAttendanceApplyTemplate(file);
        } else if ("OvertimeApply_add_Template".equalsIgnoreCase(normalizedTemplateName)) {
            return importOvertimeApplyTemplate(file);
        }

        throw new IllegalArgumentException("Template import not supported: " + normalizedTemplateName);
    }

    private List<String> importScheduleHtsvTemplate(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();

        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheet("Template");
            if (sheet == null) {
                sheet = wb.getSheetAt(0);
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                String empId = getCellStr(row.getCell(0));
                String date = getCellStr(row.getCell(2));
                String typeCodeRaw = getCellStr(row.getCell(4));
                String shiftCode = getCellStr(row.getCell(6));
                String remark = getCellStr(row.getCell(7));

                if (empId.isBlank() && date.isBlank()) {
                    continue;
                }

                if (empId.isBlank()) {
                    errors.add("Dong " + (i + 1) + ": Thieu Employee ID");
                    continue;
                }
                if (date.isBlank()) {
                    errors.add("Dong " + (i + 1) + ": Thieu Date");
                    continue;
                }
                if (shiftCode.isBlank()) {
                    errors.add("Dong " + (i + 1) + ": Thieu Shift Code (cot G)");
                    continue;
                }

                String personId = mapper.getPersonIdByEmpId(empId);
                if (personId == null) {
                    errors.add("Dong " + (i + 1) + ": Khong tim thay nhan vien voi EmpId=" + empId);
                    continue;
                }

                String arDateStr = formatDateStr(date);
                if (arDateStr == null) {
                    errors.add("Dong " + (i + 1) + ": Ngay khong dung dinh dang dd/MM/yyyy: " + date);
                    continue;
                }

                Long typeid = null;
                if (!typeCodeRaw.isBlank()) {
                    try {
                        typeid = Long.parseLong(typeCodeRaw.replaceAll("\\.0$", ""));
                    } catch (NumberFormatException ignored) {
                        // ignore
                    }
                }

                Map<String, Object> rowData = new HashMap<>();
                rowData.put("personId", personId);
                rowData.put("shiftNo", shiftCode);
                rowData.put("arDateStr", arDateStr);
                rowData.put("typeid", typeid);
                rowData.put("remark", remark.isBlank() ? null : remark);

                mapper.insertScheduleHtsv(rowData);
            }
        }
        return errors;
    }

    private List<String> importAttendanceApplyTemplate(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        Map<String, Object> clearParams = new HashMap<>();
        mapper.deleteAttendanceApplyTempByUploader(clearParams);

        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheet("Template");
            if (sheet == null) {
                sheet = wb.getSheetAt(0);
            }
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                String empId = getCellText(row.getCell(0), formatter);
                String applyName = getCellText(row.getCell(1), formatter);
                String attendanceDate = normalizeDateCell(row.getCell(2), formatter);
                String affirmFlag = "14014308";
                String leaveTypeCode = getCellStr(row.getCell(4));
                String leaveFromDate = normalizeDateCell(row.getCell(5), formatter);
                String leaveFromTime = normalizeTimeCell(row.getCell(6), formatter);
                String leaveToDate = normalizeDateCell(row.getCell(7), formatter);
                String leaveToTime = normalizeTimeCell(row.getCell(8), formatter);
                String leaveReason = getCellText(row.getCell(9), formatter);

                if (leaveFromDate.isBlank()) {
                    leaveFromDate = attendanceDate;
                }
                if (leaveToDate.isBlank()) {
                    leaveToDate = attendanceDate;
                }

                if (isAllBlank(empId, applyName, attendanceDate, affirmFlag, leaveTypeCode, leaveFromDate,
                        leaveFromTime, leaveToDate, leaveToTime, leaveReason)) {
                    continue;
                }
                if (empId.isBlank()) {
                    errors.add("Dong " + (i + 1) + ": Thieu Employee ID");
                    continue;
                }

                Map<String, Object> rowData = new HashMap<>();
                rowData.put("empId", empId.isBlank() ? null : empId);
                rowData.put("applyName", applyName.isBlank() ? null : applyName);
                rowData.put("leaveTypeCode", leaveTypeCode.isBlank() ? null : leaveTypeCode);
                rowData.put("leaveFromDate", leaveFromDate.isBlank() ? null : leaveFromDate);
                rowData.put("leaveFromTime", leaveFromTime.isBlank() ? null : leaveFromTime);
                rowData.put("leaveToDate", leaveToDate.isBlank() ? null : leaveToDate);
                rowData.put("leaveToTime", leaveToTime.isBlank() ? null : leaveToTime);
                rowData.put("applyLength", null);
                rowData.put("leaveReason", leaveReason.isBlank() ? null : leaveReason);
                rowData.put("affirmFlag", affirmFlag.isBlank() ? null : affirmFlag);
                rowData.put("lineId", String.valueOf(i));
                rowData.put("uploadErrorMsg", null);
                rowData.put("resultFlag", "N");

                try {
                    mapper.insertAttendanceApplyTemp(rowData);
                } catch (Exception ex) {
                    log.error("Failed to import attendance apply row={} empId={}", i + 1, empId, ex);
                    errors.add("Dong " + (i + 1) + ": Loi insert du lieu.");
                }
            }
        }

        Map<String, Object> validateParams = new HashMap<>();
        validateParams.put("message", "");
        mapper.callValidateAttendanceApplyTemp(validateParams);

        String validateMessage = toTrimmedString(validateParams.get("message"));
        if (isValidationErrorMessage(validateMessage)) {
            errors.add(validateMessage);
        }

        return errors;
    }

    private List<String> importOvertimeApplyTemplate(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        Map<String, Object> clearParams = new HashMap<>();
        mapper.deleteOvertimeApplyTempByUploader(clearParams);

        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheet("Template");
            if (sheet == null) {
                sheet = wb.getSheetAt(0);
            }
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                String empId = getCellText(row.getCell(0), formatter);
                String applyName = getCellText(row.getCell(1), formatter);
                String applyOtDate = normalizeDateCell(row.getCell(2), formatter);
                String otFromDate = normalizeDateCell(row.getCell(3), formatter);
                String otFromTime = normalizeTimeCell(row.getCell(4), formatter);
                String otToDate = normalizeDateCell(row.getCell(5), formatter);
                String otToTime = normalizeTimeCell(row.getCell(6), formatter);
                String deductYn = normalizeFlagCell(row.getCell(7), formatter);
                String acrossDayYn = normalizeFlagCell(row.getCell(8), formatter);
                String applyOtRemark = getCellText(row.getCell(9), formatter);

                if (otFromDate.isBlank()) {
                    otFromDate = applyOtDate;
                }
                if (otToDate.isBlank()) {
                    otToDate = applyOtDate;
                }

                if (isAllBlank(empId, applyName, applyOtDate, otFromDate, otFromTime, otToDate, otToTime, deductYn,
                        acrossDayYn, applyOtRemark)) {
                    continue;
                }
                if (empId.isBlank()) {
                    errors.add("Dong " + (i + 1) + ": Thieu Employee ID");
                    continue;
                }

                Map<String, Object> rowData = new HashMap<>();
                rowData.put("empId", empId.isBlank() ? null : empId);
                rowData.put("applyName", applyName.isBlank() ? null : applyName);
                rowData.put("applyOtDate", applyOtDate.isBlank() ? null : applyOtDate);
                rowData.put("otFromDate", otFromDate.isBlank() ? null : otFromDate);
                rowData.put("otFromTime", otFromTime.isBlank() ? null : otFromTime);
                rowData.put("otToDate", otToDate.isBlank() ? null : otToDate);
                rowData.put("otToTime", otToTime.isBlank() ? null : otToTime);
                rowData.put("otApplyHour", null);
                rowData.put("applyOtRemark", applyOtRemark.isBlank() ? null : applyOtRemark);
                rowData.put("affirmFlag", "14014306");
                rowData.put("lineId", String.valueOf(i));
                rowData.put("uploadErrorMsg", null);
                rowData.put("resultFlag", "N");
                rowData.put("otTypeCode", null);
                rowData.put("adjustYn", "0");
                rowData.put("specialYn", acrossDayYn.isBlank() ? "0" : acrossDayYn);
                rowData.put("offsetYn", "0");
                rowData.put("deductYn", deductYn.isBlank() ? "0" : deductYn);

                try {
                    mapper.insertOvertimeApplyTemp(rowData);
                } catch (Exception ex) {
                    log.error("Failed to import overtime apply row={} empId={}", i + 1, empId, ex);
                    errors.add("Dong " + (i + 1) + ": Loi insert du lieu.");
                }
            }
        }

        Map<String, Object> validateParams = new HashMap<>();
        validateParams.put("message", "");
        mapper.callValidateOvertimeApplyTemp(validateParams);

        String validateMessage = toTrimmedString(validateParams.get("message"));
        if (isValidationErrorMessage(validateMessage)) {
            errors.add(validateMessage);
        }

        return errors;
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }

    private String getCellStr(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield new SimpleDateFormat("dd/MM/yyyy").format(cell.getDateCellValue());
                }
                double d = cell.getNumericCellValue();
                yield (d == Math.floor(d)) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case FORMULA -> {
                try {
                    yield String.valueOf((long) cell.getNumericCellValue());
                } catch (Exception e) {
                    yield cell.getStringCellValue();
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String formatDateStr(String raw) {
        try {
            if (raw.matches("\\d{2}/\\d{2}/\\d{4}")) {
                String[] p = raw.split("/");
                return p[2] + "/" + p[1] + "/" + p[0];
            } else if (raw.matches("\\d{4}[/-]\\d{2}[/-]\\d{2}")) {
                return raw.replace("-", "/");
            }
        } catch (Exception ignored) {
            // ignore
        }
        return null;
    }

    private String normalizeTemplateName(String templateName) {
        if (templateName == null) {
            return null;
        }
        String value = templateName.trim();
        if (value.isEmpty()) {
            return null;
        }
        if (value.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            value = value.substring(0, value.length() - 5);
        }
        return value;
    }

    private String getCellText(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        String value = formatter.formatCellValue(cell);
        return value == null ? "" : value.trim();
    }

    private String normalizeDateCell(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return new SimpleDateFormat("yyyy-MM-dd").format(cell.getDateCellValue());
        }
        String value = getCellText(cell, formatter);
        if (value.isEmpty()) {
            return "";
        }

        if (value.matches("\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}")) {
            String[] parts = value.replace("/", "-").split("-");
            return parts[0] + "-" + pad2(parts[1]) + "-" + pad2(parts[2]);
        }

        if (value.matches("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}")) {
            String[] parts = value.replace("/", "-").split("-");
            return parts[2] + "-" + pad2(parts[1]) + "-" + pad2(parts[0]);
        }
        return value;
    }

    private String normalizeTimeCell(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                return new SimpleDateFormat("HH:mm").format(cell.getDateCellValue());
            }
            double numeric = cell.getNumericCellValue();
            if (numeric >= 0 && numeric < 1) {
                int totalMinutes = (int) Math.round(numeric * 24 * 60);
                int hour = (totalMinutes / 60) % 24;
                int minute = totalMinutes % 60;
                return String.format("%02d:%02d", hour, minute);
            }
        }

        String value = getCellText(cell, formatter);
        if (value.isEmpty()) {
            return "";
        }

        if (value.matches("\\d{1,2}:\\d{1,2}(:\\d{1,2})?")) {
            String[] parts = value.split(":");
            return pad2(parts[0]) + ":" + pad2(parts[1]);
        }

        if (value.matches("\\d{3,4}")) {
            String digits = value.length() == 3 ? "0" + value : value;
            return digits.substring(0, 2) + ":" + digits.substring(2, 4);
        }
        return value;
    }

    private String normalizeFlagCell(Cell cell, DataFormatter formatter) {
        String value = getCellText(cell, formatter);
        if (value.isEmpty()) {
            return "";
        }
        if ("1".equals(value) || "0".equals(value)) {
            return value;
        }
        if ("1.0".equals(value)) {
            return "1";
        }
        if ("0.0".equals(value)) {
            return "0";
        }
        return value;
    }

    private String pad2(String raw) {
        String value = raw == null ? "" : raw.trim();
        if (value.length() >= 2) {
            return value;
        }
        return "0" + value;
    }

    private boolean isAllBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String toTrimmedString(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private boolean isValidationErrorMessage(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.ROOT);
        return normalized.contains("error")
                || normalized.contains("loi")
                || normalized.contains("ora-");
    }

    @Override
    public List<Map<String, Object>> getDeptList() {
        try {
            List<Map<String, Object>> list = mapper.getDeptList(new HashMap<>());
            return list == null ? new ArrayList<>() : list;
        } catch (Exception e) {
            log.error("Failed to load department list for template", e);
            return new ArrayList<>();
        }
    }

    @Override
    public Workbook buildStartPointTemplate(List<List<String[]>> groups, String templateName) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + templateName + ".xlsx");
            XSSFWorkbook wb = new XSSFWorkbook(resource.getInputStream());
            XSSFSheet codeSheet = wb.getSheet("TemplateCode");
            if (codeSheet != null) {
                for (int i = codeSheet.getLastRowNum(); i >= 1; i--) {
                    Row row = codeSheet.getRow(i);
                    if (row != null) codeSheet.removeRow(row);
                }
                int maxRows = groups.stream().mapToInt(List::size).max().orElse(0);
                for (int i = 0; i < maxRows; i++) {
                    Row row = codeSheet.createRow(i + 1);
                    for (int g = 0; g < groups.size(); g++) {
                        List<String[]> group = groups.get(g);
                        if (i < group.size()) {
                            int startCol = g * 2;
                            row.createCell(startCol).setCellValue(group.get(i)[0]);
                            row.createCell(startCol + 1).setCellValue(group.get(i)[1]);
                        }
                    }
                }
            }
            return wb;
        } catch (IOException e) {
            log.error("Failed to load template from classpath templateName={}", templateName, e);
            throw new RuntimeException("Khong the doc file mau " + templateName + ".xlsx.", e);
        }
    }

    @Override
    public Workbook buildNewEmpTemplate(List<List<String[]>> groups, String templateName) {
        // groups chứa các cặp (name, code) theo thứ tự:
        // index 0  → cols A,B   (0,1)
        // index 1  → cols C,D   (2,3)
        // index 2  → cols E,F   (4,5)
        // index 3  → cols G,H   (6,7)
        // index 4  → cols I,J   (8,9)
        // index 5  → cols K,L   (10,11)
        // index 6  → cols M,N   (12,13)
        // index 7  → cols O,P   (14,15)  AND Q,R (16,17) – phòng ban (lặp 2 lần)
        // index 8  → cols S,T   (18,19)
        // index 9  → cols U,V   (20,21)
        // index 10 → cols W,X   (22,23)
        // index 11 → cols Y,Z   (24,25)
        // index 12 → cols AA,AB (26,27)
        int[] startCols = { 0, 2, 4, 6, 8, 10, 12, 14, 18, 20, 22, 24, 26 };
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + templateName + ".xlsx");
            XSSFWorkbook wb = new XSSFWorkbook(resource.getInputStream());
            XSSFSheet codeSheet = wb.getSheet("TemplateCode");
            if (codeSheet != null) {
                for (int i = codeSheet.getLastRowNum(); i >= 1; i--) {
                    Row row = codeSheet.getRow(i);
                    if (row != null) codeSheet.removeRow(row);
                }
                int maxRows = groups.stream().mapToInt(List::size).max().orElse(0);
                for (int i = 0; i < maxRows; i++) {
                    Row row = codeSheet.getRow(i + 1);
                    if (row == null) row = codeSheet.createRow(i + 1);
                    for (int g = 0; g < groups.size() && g < startCols.length; g++) {
                        List<String[]> group = groups.get(g);
                        if (i < group.size()) {
                            int col = startCols[g];
                            row.createCell(col).setCellValue(group.get(i)[0]);
                            row.createCell(col + 1).setCellValue(group.get(i)[1]);
                            // Phòng ban lặp lại ở cột Q,R (index 7)
                            if (g == 7) {
                                row.createCell(16).setCellValue(group.get(i)[0]);
                                row.createCell(17).setCellValue(group.get(i)[1]);
                            }
                        }
                    }
                }
            }
            return wb;
        } catch (IOException e) {
            log.error("Failed to load template from classpath templateName={}", templateName, e);
            throw new RuntimeException("Không thể đọc file mẫu " + templateName + ".xlsx.", e);
        }
    }

    @Override
    public Workbook buildCardRecordTemplate() {
        XSSFWorkbook wb = new XSSFWorkbook();
        XSSFSheet sheet = wb.createSheet("Template");
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "Mã nhân viên", "Họ tên", "Ngày công (YYYY/MM/DD)",
            "Ngày quẹt thẻ (YYYY/MM/DD)", "Giờ (HH:MM)", "Loại (IN/OUT)", "Ghi chú"
        };
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 6000);
        }
        // Dòng ví dụ
        Row exampleRow = sheet.createRow(1);
        exampleRow.createCell(0).setCellValue("43000001");
        exampleRow.createCell(1).setCellValue("Nguyễn Văn A");
        exampleRow.createCell(2).setCellValue("2026/01/01");
        exampleRow.createCell(3).setCellValue("2026/01/01");
        exampleRow.createCell(4).setCellValue("08:00");
        exampleRow.createCell(5).setCellValue("OUT");
        exampleRow.createCell(6).setCellValue("Ghi chú");
        return wb;
    }
}
