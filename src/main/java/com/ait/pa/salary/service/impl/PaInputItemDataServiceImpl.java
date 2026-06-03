package com.ait.pa.salary.service.impl;

import com.ait.pa.salary.dto.PaInputItemDataDto;
import com.ait.pa.salary.dto.PaParamDataTempDto;
import com.ait.pa.salary.mapper.PaInputItemDataMapper;
import com.ait.pa.salary.service.PaInputItemDataService;
import com.ait.sy.sys.dto.DataTablesResponse;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaInputItemDataServiceImpl implements PaInputItemDataService {

    private static final Logger log = LoggerFactory.getLogger(PaInputItemDataServiceImpl.class);

    @Autowired
    private PaInputItemDataMapper mapper;

    @Override
    public List<PaInputItemDataDto> getParamItemList(PaInputItemDataDto dto) {
        try {
            List<PaInputItemDataDto> list = mapper.selectParamItemList(dto);
            log.info("Lấy danh sách hạng mục tiêu chuẩn: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tiêu chuẩn: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DataTablesResponse<PaInputItemDataDto> getPagedParamDataList(PaInputItemDataDto dto) {
        try {
            long total = mapper.countParamDataList(dto);
            List<PaInputItemDataDto> data = mapper.selectParamDataListPage(dto);
            log.info("Phân trang dữ liệu tiêu chuẩn: paramNo={}, total={}", dto.getParamNo(), total);
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang dữ liệu tiêu chuẩn paramNo={}: {}", dto.getParamNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaInputItemDataDto getParamDataOne(Long paramDataNo) {
        try {
            PaInputItemDataDto dto = mapper.selectParamDataOne(paramDataNo);
            log.info("Lấy dữ liệu tiêu chuẩn paramDataNo={}", paramDataNo);
            return dto;
        } catch (Exception e) {
            log.error("Lỗi khi lấy dữ liệu tiêu chuẩn paramDataNo={}: {}", paramDataNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void insertParamData(PaInputItemDataDto dto) {
        try {
            mapper.insertParamData(dto);
            log.info("Thêm mới dữ liệu tiêu chuẩn paramNo={}, personId={}", dto.getParamNo(), dto.getPersonId());
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới dữ liệu tiêu chuẩn paramNo={}: {}", dto.getParamNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void updateParamData(PaInputItemDataDto dto) {
        try {
            mapper.updateParamData(dto);
            log.info("Cập nhật dữ liệu tiêu chuẩn paramDataNo={}", dto.getParamDataNo());
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật dữ liệu tiêu chuẩn paramDataNo={}: {}", dto.getParamDataNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteParamData(Long paramDataNo) {
        try {
            mapper.deleteParamData(paramDataNo);
            log.info("Xóa dữ liệu tiêu chuẩn paramDataNo={}", paramDataNo);
        } catch (Exception e) {
            log.error("Lỗi khi xóa dữ liệu tiêu chuẩn paramDataNo={}: {}", paramDataNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public List<String> importParamDataExcel(String paramNo, MultipartFile file) {
        List<String> errors = new ArrayList<>();
        try {
            Map<String, Object> delParams = new HashMap<>();
            mapper.deleteParamDataTemp(delParams);
            log.info("Đã xóa dữ liệu temp cũ trước khi import, paramNo={}", paramNo);

            try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
                Sheet sheet = wb.getSheet("Template");
                if (sheet == null) {
                    sheet = wb.getSheetAt(0);
                }
                DataFormatter formatter = new DataFormatter();

                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    String empId       = getCellText(row.getCell(0), formatter);
                    String localName   = getCellText(row.getCell(1), formatter);
                    String startMonth  = getCellText(row.getCell(2), formatter);
                    String endMonth    = getCellText(row.getCell(3), formatter);
                    String returnValue = getCellText(row.getCell(4), formatter);
                    String remark      = getCellText(row.getCell(5), formatter);

                    if (empId.isBlank() && startMonth.isBlank() && returnValue.isBlank()) continue;

                    if (empId.isBlank()) {
                        errors.add("Dòng " + (i + 1) + ": Thiếu Mã nhân viên");
                        continue;
                    }
                    if (startMonth.isBlank()) {
                        errors.add("Dòng " + (i + 1) + ": Thiếu Tháng bắt đầu");
                        continue;
                    }
                    if (returnValue.isBlank()) {
                        errors.add("Dòng " + (i + 1) + ": Thiếu Giá trị");
                        continue;
                    }

                    Map<String, Object> rowData = new HashMap<>();
                    rowData.put("paramNo",      paramNo);
                    rowData.put("empId",        empId);
                    rowData.put("localName",     localName.isBlank() ? null : localName);
                    rowData.put("startMonth",   startMonth);
                    rowData.put("endMonth",     endMonth.isBlank() ? null : endMonth);
                    rowData.put("returnValue",  returnValue);
                    rowData.put("remark",       remark.isBlank() ? null : remark);
                    rowData.put("lineId",       (long) i);
                    rowData.put("uploadErrorMsg", null);
                    rowData.put("resultFlag",   "N");

                    try {
                        mapper.insertParamDataTemp(rowData);
                    } catch (Exception ex) {
                        log.error("Lỗi khi insert dòng {} vào PA_PARAM_DATA_TEMP, empId={}: {}", i + 1, empId, ex.getMessage(), ex);
                        errors.add("Dòng " + (i + 1) + ": Lỗi lưu dữ liệu - " + ex.getMessage());
                    }
                }
            }
            log.info("Import Excel PA_PARAM_DATA_TEMP hoàn tất, paramNo={}, errors={}", paramNo, errors.size());
        } catch (IOException e) {
            log.error("Lỗi khi đọc file Excel import PA_PARAM_DATA_TEMP: {}", e.getMessage(), e);
            errors.add("Lỗi đọc file Excel: " + e.getMessage());
        }
        return errors;
    }

    @Override
    public List<PaParamDataTempDto> getParamDataTempList(PaParamDataTempDto dto) {
        try {
            List<PaParamDataTempDto> list = mapper.selectParamDataTempList(dto);
            log.info("Lấy danh sách PA_PARAM_DATA_TEMP, size={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách PA_PARAM_DATA_TEMP: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public String saveParamDataTemp(String paramNo) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("distinctField", paramNo);
            params.put("message", "");
            mapper.callImportParamDataTemp(params);
            String message = params.get("message") != null ? params.get("message").toString().trim() : "";
            log.info("Gọi PKG_WAGEBASE_EXCEL_TEMP.PR_IMPORT_PAPARAM_DATA, paramNo={}, message={}", paramNo, message);
            return message;
        } catch (Exception e) {
            log.error("Lỗi khi gọi stored procedure import PA_PARAM_DATA_TEMP, paramNo={}: {}", paramNo, e.getMessage(), e);
            throw e;
        }
    }

    private String getCellText(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return new SimpleDateFormat("MM").format(cell.getDateCellValue())
                 + new SimpleDateFormat("yyyy").format(cell.getDateCellValue());
        }
        String value = formatter.formatCellValue(cell);
        return value == null ? "" : value.trim();
    }
}
