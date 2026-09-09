package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaPayObjDto;
import com.ait.pa.workManagement.mapper.PaPayObjMapper;
import com.ait.pa.workManagement.service.PaPayObjService;
import com.ait.sy.sys.dto.DataTablesResponse;
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
import java.util.Arrays;
import java.util.List;

@Service
public class PaPayObjServiceImpl implements PaPayObjService {

    private static final Logger log = LoggerFactory.getLogger(PaPayObjServiceImpl.class);

    @Autowired
    private PaPayObjMapper mapper;

    @Override
    public List<PaPayObjDto> getList(PaPayObjDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DataTablesResponse<PaPayObjDto> getPagedList(PaPayObjDto params) {
        try {
            long total = mapper.countList(params);
            List<PaPayObjDto> data = mapper.selectListPage(params);
            log.info("Phân trang đối tượng nhận lương: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaPayObjDto findEmployee(String empId) {
        try {
            return mapper.selectEmployeeByEmpId(empId);
        } catch (Exception e) {
            log.error("Lỗi khi tìm nhân viên empId={}: {}", empId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(PaPayObjDto dto) {
        try {
            int dup = mapper.countDuplicate(dto.getPayScheduleNo(), dto.getEmpId());
            if (dup > 0) {
                throw new IllegalArgumentException("Nhân viên đã tồn tại trong kế hoạch trả lương này!");
            }
            mapper.insert(dto);
            log.info("Thêm mới đối tượng nhận lương: payScheduleNo={}, empId={}", dto.getPayScheduleNo(), dto.getEmpId());
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveList(List<PaPayObjDto> items) {
        try {
            for (PaPayObjDto item : items) {
                mapper.updateIncludeType(item);
                log.info("Cập nhật includeType: payScheduleNo={}, empId={}, includeType={}", item.getPayScheduleNo(), item.getEmpId(), item.getIncludeType());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<PaPayObjDto> keys) {
        try {
            for (PaPayObjDto key : keys) {
                mapper.deleteByKey(key.getPayScheduleNo(), key.getEmpId());
                log.info("Xóa đối tượng nhận lương: payScheduleNo={}, empId={}", key.getPayScheduleNo(), key.getEmpId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public byte[] exportExcel(PaPayObjDto params) {
        try {
            List<PaPayObjDto> dataList = mapper.selectList(params);
            log.info("Xuất Excel đối tượng nhận lương: rows={}", dataList.size());

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("PA Pay Object");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList(
                        "STT", "Họ tên", "Mã nhân viên", "Phòng ban", "Phân biệt",
                        "Người tạo", "Thời gian tạo", "Người thay đổi", "Thời gian thay đổi");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (PaPayObjDto row : dataList) {
                    XSSFRow dataRow = sheet.createRow(rowIdx);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(rowIdx);
                    dataRow.createCell(c++).setCellValue(row.getEmpName() != null ? row.getEmpName() : "");
                    dataRow.createCell(c++).setCellValue(row.getEmpId() != null ? row.getEmpId() : "");
                    dataRow.createCell(c++).setCellValue(row.getDeptName() != null ? row.getDeptName() : "");
                    dataRow.createCell(c++).setCellValue(
                            Integer.valueOf(1).equals(row.getIncludeType()) ? "Tham gia" : "Không tham gia");
                    dataRow.createCell(c++).setCellValue(row.getCreatedBy() != null ? row.getCreatedBy() : "");
                    dataRow.createCell(c++).setCellValue(row.getCreateDate() != null ? row.getCreateDate() : "");
                    dataRow.createCell(c++).setCellValue(row.getUpdatedBy() != null ? row.getUpdatedBy() : "");
                    dataRow.createCell(c++).setCellValue(row.getUpdateDate() != null ? row.getUpdateDate() : "");
                    rowIdx++;
                }

                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }

                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                wb.write(bos);
                return bos.toByteArray();
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel đối tượng nhận lương: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }
}
