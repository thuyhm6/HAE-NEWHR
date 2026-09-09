package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyMenuParamDto;
import com.ait.sy.basicMaintenance.mapper.SyMenuParamMapper;
import com.ait.sy.basicMaintenance.model.SyMenuParam;
import com.ait.sy.basicMaintenance.service.SyMenuParamService;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.List;

@Service
public class SyMenuParamServiceImpl implements SyMenuParamService {

    @Autowired
    private SyMenuParamMapper syMenuParamMapper;

    @Override
    public List<SyMenuParamDto> findByParentMenuAndCpny(String parentMenuNo, String cpnyId) {
        return syMenuParamMapper.findByParentMenuAndCpny(parentMenuNo, cpnyId);
    }

    @Override
    @Transactional
    public void save(SyMenuParamDto dto) {
        // Check if exists
        SyMenuParam existing = syMenuParamMapper.findByCpnyIdAndMenuNo(dto.getCpnyId(), dto.getMenuNo());

        if (existing != null) {
            // Update
            existing.setIsCanBeBuild(dto.getIsCanBeBuild());
            existing.setOrderNo(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
            existing.setActivity(dto.getParamActivity() != null ? dto.getParamActivity() : 1);
            existing.setUpdatedBy(dto.getUpdatedBy());
            syMenuParamMapper.update(existing);
        } else {
            // Insert
            SyMenuParam param = new SyMenuParam();
            String nextVal = syMenuParamMapper.getNextParamNoSeq();
            param.setParamNo(nextVal);
            param.setMenuNo(dto.getMenuNo());
            param.setCpnyId(dto.getCpnyId());
            param.setIsCanBeBuild(dto.getIsCanBeBuild());
            param.setOrderNo(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
            param.setActivity(dto.getParamActivity() != null ? dto.getParamActivity() : 1);
            param.setCreatedBy(dto.getCreatedBy());
            param.setUpdatedBy(dto.getUpdatedBy());

            syMenuParamMapper.insert(param);
        }
    }

    @Override
    @Transactional
    public void delete(String cpnyId, String menuNo) {
        syMenuParamMapper.deleteByCpnyIdAndMenuNo(cpnyId, menuNo);
    }

    @Override
    public byte[] exportExcel(String parentMenuNo, String cpnyId) {
        try {
            List<SyMenuParamDto> list = findByParentMenuAndCpny(parentMenuNo, cpnyId);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_MENU_PARAM");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList("Menu Code", "Name (VI)", "Name (EN)", "Assigned", "Order No", "Activity");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyMenuParamDto dto : list) {
                    if (!dto.isAssigned()) continue;
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getMenuCode() != null ? dto.getMenuCode() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.isAssigned() ? "Yes" : "No");
                    dataRow.createCell(c++).setCellValue(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
                    dataRow.createCell(c++).setCellValue(Integer.valueOf(1).equals(dto.getParamActivity()) ? "Active" : "Inactive");
                }

                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }

                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                wb.write(bos);
                return bos.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
