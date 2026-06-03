package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordTempDto;
import com.ait.ar.attendanceMintenance.mapper.ArMacRecordTempMapper;
import com.ait.ar.attendanceMintenance.service.ArMacRecordTempService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ArMacRecordTempServiceImpl implements ArMacRecordTempService {

    private static final Logger log = LoggerFactory.getLogger(ArMacRecordTempServiceImpl.class);
    private static final long MAX_FILE_SIZE = 5L * 1024L * 1024L;

    @Autowired
    private ArMacRecordTempMapper mapper;

    @Override
    @Transactional
    public Map<String, Object> uploadExcel(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();

        String validationError = validateFile(file);
        if (validationError != null) {
            result.put("success", false);
            result.put("message", validationError);
            return result;
        }

        try {
            mapper.deleteTempByUploader();

            try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
                Sheet sheet = wb.getSheet("Template");
                if (sheet == null) {
                    sheet = wb.getSheetAt(0);
                }
                DataFormatter formatter = new DataFormatter();

                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    String empId     = getCellText(row.getCell(0), formatter);
                    String localName = getCellText(row.getCell(1), formatter);
                    String arDateStr = normalizeDateCell(row.getCell(2), formatter);
                    String rDate     = normalizeDateCell(row.getCell(3), formatter);
                    String rTime     = normalizeTimeCell(row.getCell(4), formatter);
                    String doorType  = getCellText(row.getCell(5), formatter).toUpperCase(Locale.ROOT);
                    String remark    = getCellText(row.getCell(6), formatter);

                    if (isAllBlank(empId, localName, arDateStr, rDate, rTime, doorType, remark)) {
                        continue;
                    }

                    String rowError = null;
                    if (empId.isBlank()) {
                        rowError = "Dòng " + (i + 1) + ": Thiếu Mã nhân viên (cột A)";
                    } else if (rDate.isBlank()) {
                        rowError = "Dòng " + (i + 1) + ": Thiếu Ngày quẹt thẻ (cột D)";
                    } else if (rTime.isBlank()) {
                        rowError = "Dòng " + (i + 1) + ": Thiếu Giờ quẹt thẻ (cột E)";
                    } else if (doorType.isBlank()) {
                        rowError = "Dòng " + (i + 1) + ": Thiếu Loại (cột F)";
                    }

                    if (rowError != null) {
                        errors.add(rowError);
                        continue;
                    }

                    ArMacRecordTempDto dto = new ArMacRecordTempDto();
                    dto.setLineId((long) i);
                    dto.setCardNo(empId.trim());
                    dto.setEmpId(empId.trim());
                    dto.setLocalName(localName.isBlank() ? null : localName.trim());
                    dto.setArDateStr(arDateStr.isBlank() ? null : arDateStr.trim());
                    dto.setRDate(rDate.trim());
                    dto.setRTime(rTime.trim());
                    dto.setDoorType(doorType.trim());
                    dto.setRemark(remark.isBlank() ? null : remark.trim());
                    dto.setUploadErrorMsg(null);

                    try {
                        mapper.insertTemp(dto);
                    } catch (Exception ex) {
                        log.error("[ArMacRecordTemp] insertTemp row={} empId={} error", i + 1, empId, ex);
                        errors.add("Dòng " + (i + 1) + ": Lỗi khi lưu dữ liệu.");
                    }
                }
            }

            if (errors.isEmpty()) {
                result.put("success", true);
                result.put("message", "Import thành công! Vui lòng kiểm tra và xác nhận dữ liệu.");
            } else {
                result.put("success", false);
                result.put("errors", errors);
                result.put("message", "Import hoàn tất nhưng có " + errors.size() + " lỗi.");
            }
        } catch (IOException e) {
            log.error("[ArMacRecordTemp] uploadExcel IO error", e);
            result.put("success", false);
            result.put("message", "Không thể đọc file Excel: " + e.getMessage());
        } catch (Exception e) {
            log.error("[ArMacRecordTemp] uploadExcel error", e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi xử lý file: " + e.getMessage());
        }
        return result;
    }

    @Override
    public List<ArMacRecordTempDto> getList(String errorOnly) {
        try {
            ArMacRecordTempDto dto = new ArMacRecordTempDto();
            dto.setErrorOnly(errorOnly);
            return mapper.selectList(dto);
        } catch (Exception e) {
            log.error("[ArMacRecordTemp] getList error", e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> confirm() {
        Map<String, Object> result = new HashMap<>();
        int total = 0, inserted = 0, skippedDup = 0, skippedNoEmp = 0;

        try {
            List<ArMacRecordTempDto> tempList = mapper.selectAllForConfirm();
            total = tempList.size();

            for (ArMacRecordTempDto temp : tempList) {
                String empId    = temp.getEmpId();
                String rDate    = temp.getRDate();
                String rTime    = temp.getRTime();
                String doorType = temp.getDoorType();

                if (empId == null || rDate == null || rTime == null) {
                    log.warn("[confirm] Bỏ qua dòng {} - thiếu dữ liệu bắt buộc", temp.getLineId());
                    skippedNoEmp++;
                    continue;
                }

                // Tìm PERSON_ID để lưu vào empId field (tái sử dụng field)
                String personId = mapper.findPersonIdByEmpId(empId.trim());
                if (personId == null) {
                    log.warn("[confirm] Không tìm thấy PERSON_ID cho EMPID={}", empId);
                    skippedNoEmp++;
                    continue;
                }

                // Kết hợp ngày + giờ để kiểm tra trùng: "YYYY/MM/DD HH:MM"
                String combinedDatetime = rDate.trim() + " " + rTime.trim();

                int dupCount = mapper.countDuplicateInHtsv(empId.trim(), combinedDatetime, doorType);
                if (dupCount > 0) {
                    log.debug("[confirm] Bỏ qua trùng: empId={}, datetime={}, doorType={}", empId, combinedDatetime, doorType);
                    skippedDup++;
                    continue;
                }

                // Chuẩn bị DTO để insert vào HTSV
                ArMacRecordTempDto insertDto = new ArMacRecordTempDto();
                insertDto.setCardNo(empId.trim());
                insertDto.setEmpId(personId);  // Dùng empId field để truyền PERSON_ID vào mapper
                insertDto.setDoorType(doorType);
                insertDto.setRemark(temp.getRemark());
                insertDto.setArDateStr(temp.getArDateStr() != null ? temp.getArDateStr() : rDate.trim());
                insertDto.setRDate(rDate.trim());
                insertDto.setRTime(rTime.trim());
                mapper.insertIntoHtsv(insertDto);
                inserted++;
            }

            // Xóa toàn bộ dữ liệu temp của người dùng hiện tại
            mapper.deleteTempByUploader();

            log.info("[confirm] total={}, inserted={}, skippedDup={}, skippedNoEmp={}", total, inserted, skippedDup, skippedNoEmp);
            result.put("success", true);
            result.put("total", total);
            result.put("inserted", inserted);
            result.put("skippedDup", skippedDup);
            result.put("skippedNoEmp", skippedNoEmp);
            result.put("message", "Xác nhận thành công: " + inserted + " bản ghi được lưu, "
                    + skippedDup + " bỏ qua (trùng), " + skippedNoEmp + " không tìm thấy nhân viên.");
        } catch (Exception e) {
            log.error("[ArMacRecordTemp] confirm error", e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi xác nhận dữ liệu: " + e.getMessage());
        }
        return result;
    }

    private String validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "Vui lòng chọn file để import.";
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return "File vượt quá kích thước tối đa 5MB.";
        }
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "Tên file không hợp lệ.";
        }
        String nameLower = name.toLowerCase(Locale.ROOT);
        if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xls")) {
            return "Chỉ hỗ trợ file Excel .xlsx hoặc .xls.";
        }
        return null;
    }

    private boolean isAllBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return false;
        }
        return true;
    }

    private String getCellText(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
        String value = formatter.formatCellValue(cell);
        return value == null ? "" : value.trim();
    }

    private String normalizeDateCell(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return new SimpleDateFormat("yyyy/MM/dd").format(cell.getDateCellValue());
        }
        String value = getCellText(cell, formatter);
        if (value.isEmpty()) return "";

        // YYYY/MM/DD hoặc YYYY-MM-DD
        if (value.matches("\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}")) {
            String[] parts = value.replace("-", "/").split("/");
            return parts[0] + "/" + pad2(parts[1]) + "/" + pad2(parts[2]);
        }
        // DD/MM/YYYY hoặc DD-MM-YYYY
        if (value.matches("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}")) {
            String[] parts = value.replace("-", "/").split("/");
            return parts[2] + "/" + pad2(parts[1]) + "/" + pad2(parts[0]);
        }
        return value;
    }

    private String normalizeTimeCell(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
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
        if (value.isEmpty()) return "";
        if (value.matches("\\d{1,2}:\\d{1,2}(:\\d{1,2})?")) {
            String[] parts = value.split(":");
            return pad2(parts[0]) + ":" + pad2(parts[1]);
        }
        return value;
    }

    private String pad2(String raw) {
        String v = raw == null ? "" : raw.trim();
        return v.length() >= 2 ? v : ("0" + v);
    }
}
