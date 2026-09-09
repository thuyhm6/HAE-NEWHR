package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;
import com.ait.sy.basicMaintenance.mapper.SyCodeParamMapper;
import com.ait.sy.basicMaintenance.model.SyCodeParam;
import com.ait.sy.basicMaintenance.service.SyCodeParamService;

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
public class SyCodeParamServiceImpl implements SyCodeParamService {

    @Autowired
    private SyCodeParamMapper syCodeParamMapper;

    @Override
    public List<SyCodeParamDto> getList(String parentCode, String cpnyId) {
        return syCodeParamMapper.selectParamByParentAndCompany(parentCode, cpnyId, "vi");
    }

    @Override
    @Transactional
    public void save(SyCodeParamDto dto) {
        if (syCodeParamMapper.existsByCodeNoAndCpnyId(dto.getCodeNo(), dto.getCpnyId())) {
            return;
        }


        SyCodeParam param = new SyCodeParam();
        param.setCodeNo(dto.getCodeNo());
        param.setCpnyId(dto.getCpnyId());
        param.setOrderNo(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
        param.setActivity(dto.getActivity() != null ? dto.getActivity() : "1");

        syCodeParamMapper.insert(param);
    }

    @Override
    @Transactional
    public void update(SyCodeParamDto dto) {
        SyCodeParam param = syCodeParamMapper.findByCodeNoAndCpnyId(dto.getCodeNo(), dto.getCpnyId());
        if (param != null) {
            param.setOrderNo(dto.getOrderNo());

            param.setOrderNo(dto.getOrderNo());
            param.setActivity(dto.getActivity());

            syCodeParamMapper.update(param);
        }
    }

    @Override
    @Transactional
    public void delete(String codeNo, String cpnyId) {
        syCodeParamMapper.deleteByCodeNoAndCpnyId(codeNo, cpnyId);
    }

    @Override
    @Transactional
    public void deleteByParamNo(String paramNo) {
        syCodeParamMapper.deleteByParamNo(paramNo);
    }

    @Override
    public byte[] exportExcel(String parentCode, String cpnyId) {
        try {
            List<SyCodeParamDto> list = syCodeParamMapper.selectParamByParentAndCompany(parentCode, cpnyId, "vi");

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_CODE_PARAM");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList("Mã Code", "Tên TV", "Tên TA", "Thứ tự", "Trạng thái");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyCodeParamDto dto : list) {
                    if (!dto.isAssigned()) continue;
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getCodeNo() != null ? dto.getCodeNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
                    dataRow.createCell(c++).setCellValue("1".equals(dto.getParamActivity()) ? "Active" : "Inactive");
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
