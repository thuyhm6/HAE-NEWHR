package com.ait.pa.salary.service.impl;

import com.ait.pa.salary.dto.PaItemInputDto;
import com.ait.pa.salary.dto.PaItemInputSaveReqDto;
import com.ait.pa.salary.dto.PaResultExportReqDto;
import com.ait.pa.salary.mapper.PaItemInputMapper;
import com.ait.pa.salary.service.PaItemInputService;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaItemInputServiceImpl implements PaItemInputService {

    private static final Logger log = LoggerFactory.getLogger(PaItemInputServiceImpl.class);

    @Autowired
    private PaItemInputMapper mapper;

    @Override
    public Map<String, List<PaItemInputDto>> getAllSectionItems() {
        try {
            Map<String, List<PaItemInputDto>> result = new HashMap<>();
            result.put("hrItems",         mapper.selectHrItems());
            result.put("attendanceItems", mapper.selectAttendanceItems());
            result.put("inputItems",      mapper.selectInputItems());
            result.put("computeItems",    mapper.selectComputeItems());
            log.info("Lấy danh sách hạng mục tất cả phần: hr={}, att={}, inp={}, cal={}",
                    result.get("hrItems").size(), result.get("attendanceItems").size(),
                    result.get("inputItems").size(), result.get("computeItems").size());
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaItemInputDto> getSavedItems(Integer isUse, Integer itemType) {
        try {
            List<PaItemInputDto> list = mapper.selectSavedItems(isUse, itemType);
            log.info("Lấy PA_ITEM_INPUT isUse={}, itemType={}: count={}", isUse, itemType, list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy PA_ITEM_INPUT isUse={}, itemType={}: {}", isUse, itemType, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveItems(PaItemInputSaveReqDto req) {
        try {
            mapper.deleteByIsUseAndItemType(req.getIsUse(), req.getItemType());
            if (req.getItems() != null && !req.getItems().isEmpty()) {
                for (PaItemInputDto item : req.getItems()) {
                    item.setIsUse(req.getIsUse());
                    item.setItemType(req.getItemType());
                    item.setActivity(1);
                    mapper.insertItem(item);
                }
            }
            log.info("Lưu PA_ITEM_INPUT isUse={}, itemType={}: count={}", req.getIsUse(), req.getItemType(),
                    req.getItems() == null ? 0 : req.getItems().size());
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_ITEM_INPUT isUse={}, itemType={}: {}", req.getIsUse(), req.getItemType(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất Excel kết quả tính lương - port từ /pa/excelExport/exportResult +
     * ExcelUtilSerImp#exportIntoExcel bản cũ: cột là các hạng mục được tích chọn,
     * sắp theo thứ tự (trống = 999, giữ thứ tự ổn định), số của hạng mục nhập/tính
     * định dạng 0.00000.
     */
    @Override
    public byte[] exportSummaryHae(PaResultExportReqDto req) {
        try {
            List<PaResultExportReqDto.Column> columns = new ArrayList<>();
            for (PaResultExportReqDto.Column c : req.getColumns()) {
                if (c.getItemId() != null && !c.getItemId().trim().isEmpty()) {
                    columns.add(c);
                }
            }
            columns.sort(Comparator.comparingInt(c -> c.getOrderNo() == null ? 999 : c.getOrderNo()));

            List<Map<String, Object>> dataList = mapper.selectSummaryHaeData(req.getPayScheduleNo(), req.getDeptNo());
            log.info("Xuất Excel PA_SUMMARY_HAE payScheduleNo={}, deptNo={}, columns={}: rows={}",
                    req.getPayScheduleNo(), req.getDeptNo(), columns.size(), dataList.size());

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("sheet1");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                CellStyle decimalStyle = wb.createCellStyle();
                decimalStyle.setDataFormat(wb.createDataFormat().getFormat("0.00000"));
                CellStyle dateStyle = wb.createCellStyle();
                dateStyle.setDataFormat(wb.createDataFormat().getFormat("dd/mm/yyyy"));

                XSSFRow headerRow = sheet.createRow(0);
                for (int i = 0; i < columns.size(); i++) {
                    PaResultExportReqDto.Column c = columns.get(i);
                    XSSFCell cell = headerRow.createCell(i);
                    cell.setCellValue(c.getItemName() != null ? c.getItemName() : c.getItemId());
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Map<String, Object> row : dataList) {
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    for (int i = 0; i < columns.size(); i++) {
                        PaResultExportReqDto.Column c = columns.get(i);
                        Object val = row.get(c.getItemId().toUpperCase());
                        XSSFCell cell = dataRow.createCell(i);
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                            if (Boolean.TRUE.equals(c.getDecimal())) {
                                cell.setCellStyle(decimalStyle);
                            }
                        } else if (val instanceof java.util.Date) {
                            cell.setCellValue((java.util.Date) val);
                            cell.setCellStyle(dateStyle);
                        } else {
                            cell.setCellValue(str(val));
                        }
                    }
                }

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                wb.write(baos);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel PA_SUMMARY_HAE payScheduleNo={}: {}", req.getPayScheduleNo(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xuất Excel: " + e.getMessage(), e);
        }
    }

    private String str(Object val) {
        return val != null ? val.toString() : "";
    }
}
