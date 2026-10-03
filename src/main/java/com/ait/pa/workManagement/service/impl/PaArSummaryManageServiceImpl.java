package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaArSummaryItemDto;
import com.ait.pa.workManagement.dto.PaArSummaryManageDto;
import com.ait.pa.workManagement.dto.PaArSummarySaveReqDto;
import com.ait.pa.workManagement.dto.PaArSummaryScheduleDto;
import com.ait.pa.workManagement.mapper.PaArSummaryManageMapper;
import com.ait.pa.workManagement.service.PaArSummaryManageService;
import com.ait.pa.workManagement.service.PaWorkFlowService;
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
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaArSummaryManageServiceImpl implements PaArSummaryManageService {

    private static final Logger log = LoggerFactory.getLogger(PaArSummaryManageServiceImpl.class);

    @Autowired
    private PaArSummaryManageMapper mapper;

    @Autowired
    private PaWorkFlowService paWorkFlowService;

    @Override
    @Transactional(readOnly = true)
    public List<PaArSummaryScheduleDto> getScheduleList() {
        try {
            List<PaArSummaryScheduleDto> list = mapper.selectScheduleList();
            log.info("Lấy danh sách kế hoạch trả lương (kèm cờ chốt lương): size={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaArSummaryItemDto> getItemList() {
        try {
            List<PaArSummaryItemDto> list = mapper.selectItemList();
            log.info("Lấy danh sách hạng mục tổng hợp chấm công: size={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tổng hợp chấm công: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaArSummaryManageDto> getList(PaArSummaryManageDto params) {
        try {
            if (params.getPayScheduleNo() == null || params.getPayScheduleNo().trim().isEmpty()) {
                return new ArrayList<>();
            }
            List<PaArSummaryManageDto> list = mapper.selectList(params);
            log.info("Tra cứu tổng hợp chấm công payScheduleNo={}, key={}, deptNo={}: size={}",
                    params.getPayScheduleNo(), params.getKey(), params.getDeptNo(), list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu tổng hợp chấm công payScheduleNo={}: {}", params.getPayScheduleNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int save(PaArSummarySaveReqDto req) {
        try {
            Integer confirmFlag = paWorkFlowService.getConfirmFlag(req.getPayScheduleNo());
            if (Integer.valueOf(1).equals(confirmFlag)) {
                throw new IllegalStateException("Lương đã xác nhận, không thể sửa!");
            }
            int count = 0;
            for (PaArSummaryManageDto item : req.getItems()) {
                if (item.getArSummaryManageNo() == null) {
                    continue;
                }
                count += mapper.update(item);
            }
            log.info("Cập nhật giá trị ngoại lệ tổng hợp chấm công payScheduleNo={}: {} dòng", req.getPayScheduleNo(), count);
            return count;
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật tổng hợp chấm công payScheduleNo={}: {}", req.getPayScheduleNo(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Xuất Excel dạng pivot: mỗi nhân viên 1 dòng, mỗi hạng mục (MANAGE_FLAG = 1) 1 cột,
     * giá trị = NVL(FINAL_VALUE, CAL_VALUE) - giống bản gốc (dựng SQL động DECODE/MAX),
     * ở đây pivot trong Java để tránh nối chuỗi SQL.
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(PaArSummaryManageDto params) {
        try {
            List<PaArSummaryItemDto> items = mapper.selectItemList();
            List<PaArSummaryManageDto> data = mapper.selectExcelList(params);

            Map<String, PaArSummaryManageDto> empMap = new LinkedHashMap<>();
            Map<String, Map<String, BigDecimal>> valueMap = new HashMap<>();
            for (PaArSummaryManageDto row : data) {
                empMap.putIfAbsent(row.getEmpId(), row);
                BigDecimal val = row.getFinalValue() != null ? row.getFinalValue() : row.getCalValue();
                valueMap.computeIfAbsent(row.getEmpId(), k -> new HashMap<>()).put(row.getItemNo(), val);
            }

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("ArSummary");
                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = new ArrayList<>();
                headers.add("employeeNo");
                headers.add("employeeName");
                headers.add("departmentName");
                for (PaArSummaryItemDto item : items) {
                    headers.add(item.getItemName() != null ? item.getItemName() : item.getItemNo());
                }
                XSSFRow headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.size(); i++) {
                    XSSFCell cell = headerRow.createCell(i);
                    cell.setCellValue(headers.get(i));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Map.Entry<String, PaArSummaryManageDto> entry : empMap.entrySet()) {
                    PaArSummaryManageDto emp = entry.getValue();
                    Map<String, BigDecimal> values = valueMap.getOrDefault(entry.getKey(), new HashMap<>());
                    XSSFRow row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(emp.getEmpId() != null ? emp.getEmpId() : "");
                    row.createCell(1).setCellValue(emp.getLocalName() != null ? emp.getLocalName() : "");
                    row.createCell(2).setCellValue(emp.getDeptName() != null ? emp.getDeptName() : "");
                    for (int i = 0; i < items.size(); i++) {
                        BigDecimal v = values.get(items.get(i).getItemNo());
                        row.createCell(3 + i).setCellValue(v != null ? v.doubleValue() : 0d);
                    }
                }
                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                wb.write(bos);
                log.info("Xuất Excel tổng hợp chấm công payScheduleNo={}: {} nhân viên, {} hạng mục",
                        params.getPayScheduleNo(), empMap.size(), items.size());
                return bos.toByteArray();
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel tổng hợp chấm công payScheduleNo={}: {}", params.getPayScheduleNo(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xuất Excel tổng hợp chấm công", e);
        }
    }
}
