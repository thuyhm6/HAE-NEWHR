package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitDto;
import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitSaveRequest;
import com.ait.ar.attendanceMintenance.mapper.ArOverTimeLimitMapper;
import com.ait.ar.attendanceMintenance.service.ArOverTimeLimitService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Giới hạn tăng ca - port từ ArDetailSerImp#viewArDetailListWithTarget("viewOverTimeLimit"),
 * #updateOvertimeLimit, #overTimeLimitImportDemo và ExcelImportCtroller#importOTLimitTSTO
 * của dự án cũ.
 */
@Service
public class ArOverTimeLimitServiceImpl implements ArOverTimeLimitService {

    private static final Logger log = LoggerFactory.getLogger(ArOverTimeLimitServiceImpl.class);
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

    /** Header file mẫu giữ nguyên như overTimeLimitImportDemo dự án cũ. */
    private static final String[] TEMPLATE_HEADERS = {
            "Employee_ID",
            "Employee_Name",
            "Lock or not (30 hours) (1: lock, 0: unlock)",
            "Lock or not (80 hours)(1: lock, 0: unlock)"
    };

    @Autowired
    private ArOverTimeLimitMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ArOverTimeLimitDto> getList(ArOverTimeLimitDto params) {
        ArOverTimeLimitDto safeParams = params == null ? new ArOverTimeLimitDto() : params;
        // Giống bản cũ: không truyền tháng thì mặc định tháng hiện tại.
        if (isBlank(safeParams.getStartMonth()) && isBlank(safeParams.getEndMonth())) {
            String currentMonth = YearMonth.now().format(MONTH_FORMATTER);
            safeParams.setStartMonth(currentMonth);
            safeParams.setEndMonth(currentMonth);
        }
        log.info("getList overTimeLimit startMonth={}, endMonth={}, deptNos={}, keyword={}",
                safeParams.getStartMonth(), safeParams.getEndMonth(), safeParams.getDeptNos(), safeParams.getKeyword());
        try {
            return mapper.selectOverTimeLimitList(safeParams);
        } catch (Exception e) {
            log.error("Failed to load overTimeLimit list", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int saveOverTimeLimit(ArOverTimeLimitSaveRequest request) {
        List<ArOverTimeLimitSaveRequest.Item> items = request.getItems();
        log.info("saveOverTimeLimit items={}", items.size());
        int updated = 0;
        try {
            for (ArOverTimeLimitSaveRequest.Item item : items) {
                updated += mapper.updateOverTimeLimit(item.getOtLimitNo(), item.getOtLimitMonth(), item.getOtLimitYear());
            }
        } catch (Exception e) {
            log.error("Failed to save overTimeLimit items={}", items.size(), e);
            throw e;
        }
        log.info("saveOverTimeLimit updated={}", updated);
        return updated;
    }

    @Override
    public Workbook buildImportTemplate() {
        log.info("buildImportTemplate overTimeLimit");
        XSSFWorkbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Over_Time_Limit");

        CellStyle headerStyle = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setBold(true);
        headerStyle.setFont(font);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row header = sheet.createRow(0);
        for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(TEMPLATE_HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }
        // Dòng ví dụ giống file mẫu cũ.
        Row sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("43170001");
        sample.createCell(1).setCellValue("Employee 1");
        sample.createCell(2).setCellValue("0");
        sample.createCell(3).setCellValue("0");

        // Đặt độ rộng cố định (autoSizeColumn cần AWT/font, dễ lỗi trên server headless).
        for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
            sheet.setColumnWidth(i, Math.max(15, TEMPLATE_HEADERS[i].length() + 4) * 256);
        }
        return wb;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> importOverTimeLimit(MultipartFile file) throws IOException {
        log.info("importOverTimeLimit file={}", file.getOriginalFilename());
        List<String> errors = new ArrayList<>();
        int success = 0;
        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                String empId = cellText(row.getCell(0), formatter);
                String lockMonth = cellText(row.getCell(2), formatter);
                String lockYear = cellText(row.getCell(3), formatter);
                if (empId.isEmpty() && lockMonth.isEmpty() && lockYear.isEmpty()) {
                    continue;
                }
                int lineNo = i + 1;
                if (empId.isEmpty()) {
                    errors.add("Dong " + lineNo + ": Thieu Employee_ID");
                    continue;
                }
                Integer otLimit = parseFlag(lockMonth);
                Integer otLimit100 = parseFlag(lockYear);
                if (otLimit == null || otLimit100 == null) {
                    errors.add("Dong " + lineNo + ": Gia tri khoa phai la 0 hoac 1 (EmpId=" + empId + ")");
                    continue;
                }
                String personId = mapper.selectPersonIdByEmpId(empId);
                if (personId == null) {
                    errors.add("Dong " + lineNo + ": Khong tim thay nhan vien voi EmpId=" + empId);
                    continue;
                }
                mapper.updateEmployeeOtLimit(personId, otLimit, otLimit100);
                success++;
            }
        } catch (IOException e) {
            log.error("Failed to read overTimeLimit import file", e);
            throw e;
        }
        log.info("importOverTimeLimit success={}, errors={}", success, errors.size());
        return errors;
    }

    private Integer parseFlag(String value) {
        String v = value.replaceAll("\\.0+$", "");
        if ("0".equals(v) || "1".equals(v)) {
            return Integer.valueOf(v);
        }
        return null;
    }

    private String cellText(Cell cell, DataFormatter formatter) {
        return cell == null ? "" : formatter.formatCellValue(cell).trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
