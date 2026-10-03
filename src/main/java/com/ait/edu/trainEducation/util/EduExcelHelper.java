package com.ait.edu.trainEducation.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * Tiện ích Excel (.xlsx) cho module đào tạo: xuất bảng đơn giản (header + dữ liệu)
 * và đọc dữ liệu dạng chuỗi từ file import. Viết riêng vì ExcelService dùng chung
 * (com.ait.sy.excel) chỉ phục vụ các mẫu cố định của module chấm công.
 */
public final class EduExcelHelper {

    private EduExcelHelper() {
    }

    /** Tạo file .xlsx gồm 1 sheet: dòng tiêu đề + các dòng dữ liệu. */
    public static byte[] write(String sheetName, List<String> headers, List<List<Object>> rows) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet(sheetName);
            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers.get(i));
                c.setCellStyle(headerStyle);
            }
            for (int r = 0; r < rows.size(); r++) {
                Row row = sheet.createRow(r + 1);
                List<Object> values = rows.get(r);
                for (int i = 0; i < values.size(); i++) {
                    Object v = values.get(i);
                    row.createCell(i).setCellValue(v == null ? "" : String.valueOf(v));
                }
            }
            for (int i = 0; i < headers.size(); i++) {
                sheet.setColumnWidth(i, 20 * 256);
            }
            wb.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Đọc sheet đầu tiên, bỏ qua dòng tiêu đề (dòng 0). Ô ngày được chuyển về dd/MM/yyyy,
     * ô giờ (chỉ có phần giờ) chuyển về HH:mm. Dòng trống hoàn toàn bị bỏ qua.
     * Mỗi phần tử trả về: [0] = số dòng Excel (1-based), [1..n] = giá trị các cột.
     */
    public static List<String[]> read(InputStream in, int columnCount) throws IOException {
        List<String[]> result = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        SimpleDateFormat dateFmt = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm");
        try (Workbook wb = WorkbookFactory.create(in)) {
            Sheet sheet = wb.getSheetAt(0);
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }
                String[] values = new String[columnCount + 1];
                values[0] = String.valueOf(r + 1);
                boolean hasValue = false;
                for (int c = 0; c < columnCount; c++) {
                    Cell cell = row.getCell(c);
                    String v = "";
                    if (cell != null) {
                        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                            double raw = cell.getNumericCellValue();
                            v = raw < 1 ? timeFmt.format(cell.getDateCellValue()) : dateFmt.format(cell.getDateCellValue());
                        } else {
                            v = formatter.formatCellValue(cell).trim();
                        }
                    }
                    values[c + 1] = v;
                    if (!v.isEmpty()) {
                        hasValue = true;
                    }
                }
                if (hasValue) {
                    result.add(values);
                }
            }
        }
        return result;
    }
}
