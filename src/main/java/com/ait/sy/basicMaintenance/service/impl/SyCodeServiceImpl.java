package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyCodeDto;
import com.ait.sy.basicMaintenance.mapper.SyCodeMapper;
import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.basicMaintenance.service.SyCodeService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

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
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class SyCodeServiceImpl implements SyCodeService {

    @Autowired
    private SyCodeMapper syCodeMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<SyCodeDto> getCodeTree() {
        return syCodeMapper.findCodeWithParentNo(null);
    }

    @Override
    public List<SyCodeDto> getCodeList(String parentCodeNo) {
        if (parentCodeNo == null || parentCodeNo.isEmpty()) {
            return syCodeMapper.findCodeWithParentNo("ROOT");
        }
        return syCodeMapper.findCodeWithParentNo(parentCodeNo);
    }

    @Override
    public List<SyCodeDto> getUseCodeList(String parentCodeNo) {
        if (parentCodeNo == null || parentCodeNo.isEmpty()) {
            return syCodeMapper.findUseCodeWithParentNo("ROOT");
        }
        return syCodeMapper.findUseCodeWithParentNo(parentCodeNo);
    }

    @Override
    @Transactional
    public void saveCode(SyCodeDto dto) {
        boolean isNew = dto.getCodeNo() == null || dto.getCodeNo().trim().isEmpty()
                || !syCodeMapper.existsByCodeNo(dto.getCodeNo());

        String codeNo = dto.getCodeNo();
        if (isNew) {
            codeNo = String.valueOf(syCodeMapper.getNextGlobalNoSeq());
            dto.setCodeNo(codeNo); // Update DTO with generated ID
        }

        SyCode code = new SyCode();
        code.setCodeNo(codeNo);
        code.setDescription(dto.getDescription());
        code.setDepth(dto.getDepth());
        code.setParentCodeNo(dto.getParentCodeNo());
        code.setOperationId(dto.getOperationId());
        code.setOrderNo(dto.getOrderNo());
        code.setActivity(dto.getActivity() != null ? dto.getActivity() : "1");
        code.setRemark(dto.getRemark());
        code.setGroupCode(dto.getGroupCode());
        code.setCodeId(dto.getCodeId());

        if (!isNew) {
            syCodeMapper.update(code);
        } else {
            syCodeMapper.insert(code);
        }

        saveGlobalName(codeNo, "vi", dto.getNameVi());
        saveGlobalName(codeNo, "en", dto.getNameEn());
        saveGlobalName(codeNo, "zh", dto.getNameZh());
        saveGlobalName(codeNo, "ko", dto.getNameKo());
    }

    private void saveGlobalName(String no, String lang, String content) {
        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);

        if (existing != null) {
            existing.setContent(content);
            existing.setUpdateDate(LocalDateTime.now());
            // Ensure activity is set if null
            if (existing.getActivity() == null)
                existing.setActivity("1");
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName globalName = new SyGlobalName();
            globalName.setNo(no);
            globalName.setLanguage(lang);
            globalName.setContent(content);
            globalName.setActivity("1");
            globalName.setOrderNo(0);
            syGlobalNameMapper.insert(globalName);
        }
    }

    @Override
    @Transactional
    public void deleteCode(String codeNo) {
        syGlobalNameMapper.deleteByNo(codeNo);
        syCodeMapper.deleteByCodeNo(codeNo);
    }

    @Override
    public List<SyCodeDto> searchCode(String keyword) {
        return syCodeMapper.searchCodeWithNames(keyword);
    }

    @Override
    public byte[] exportExcel() {
        try {
            List<SyCodeDto> list = syCodeMapper.findCodeWithParentNo(null);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_CODE");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList(
                        "Code No", "Parent Code", "Name (VI)", "Name (EN)", "Name (ZH)", "Name (KO)", "Description");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyCodeDto dto : list) {
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getCodeNo() != null ? dto.getCodeNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getParentCodeNo() != null ? dto.getParentCodeNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameZh() != null ? dto.getNameZh() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameKo() != null ? dto.getNameKo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getDescription() != null ? dto.getDescription() : "");
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
