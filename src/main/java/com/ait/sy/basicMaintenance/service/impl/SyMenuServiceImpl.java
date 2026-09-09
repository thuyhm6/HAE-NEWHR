package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyMenuDto;
import com.ait.sy.basicMaintenance.mapper.SyMenuMapper;
import com.ait.sy.basicMaintenance.model.SyMenu;
import com.ait.sy.basicMaintenance.service.SyMenuService;
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
import java.util.Arrays;
import java.util.List;

@Service
public class SyMenuServiceImpl implements SyMenuService {

    @Autowired
    private SyMenuMapper syMenuMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<SyMenuDto> findAll(String keyword) {
        return syMenuMapper.findAll(keyword);
    }

    @Override
    @Transactional
    public void save(SyMenuDto dto) {
        String seqId = dto.getMenuNo();
        boolean isNew = (seqId == null || seqId.isEmpty());

        if (isNew) {
            seqId = syMenuMapper.getNextGlobalNoSeq();
            dto.setMenuNo(seqId);
        }

        SyMenu menu = new SyMenu();
        menu.setMenuNo(seqId);
        menu.setMenuParentNo(dto.getMenuParentNo());
        menu.setMenuCode(dto.getMenuCode());
        menu.setMenuImg(dto.getMenuImg());
        menu.setDepth(dto.getDepth() == null ? 0 : dto.getDepth());
        menu.setMenuUrl(dto.getMenuUrl());
        menu.setOrderNo(dto.getOrderNo() == null ? 0 : dto.getOrderNo());
        menu.setActivity(dto.getActivity() == null ? 1 : dto.getActivity());

        if (isNew) {
            syMenuMapper.insert(menu);
        } else {
            syMenuMapper.update(menu);
        }

        // Save Multilingual Names
        if (seqId != null) {
            saveGlobalName(seqId, "vi", dto.getNameVi());
            saveGlobalName(seqId, "en", dto.getNameEn());
            saveGlobalName(seqId, "zh", dto.getNameZh());
            saveGlobalName(seqId, "ko", dto.getNameKo());
        }
    }

    private void saveGlobalName(String no, String lang, String content) {
        if (content == null)
            content = "";

        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);

        if (existing != null) {
            existing.setContent(content);
            if (existing.getActivity() == null || !existing.getActivity().equals("1")) {
                existing.setActivity("1");
            }
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName globalName = new SyGlobalName();
            globalName.setNo(no);
            globalName.setLanguage(lang);
            globalName.setContent(content);
            globalName.setActivity("1"); // Active
            globalName.setOrderNo(0);
            syGlobalNameMapper.insert(globalName);
        }
    }

    @Override
    @Transactional
    public void delete(String menuNo) {
        if (menuNo != null) {
            // Soft delete
            syMenuMapper.deleteByMenuNo(menuNo);
        }
    }

    @Override
    public byte[] exportExcel() {
        try {
            List<SyMenuDto> list = syMenuMapper.findAll(null);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_MENU");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList("Menu No", "Code", "Name (VI)", "Name (EN)", "Parent No", "URL", "Order No");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyMenuDto dto : list) {
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getMenuNo() != null ? dto.getMenuNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getMenuCode() != null ? dto.getMenuCode() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.getMenuParentNo() != null ? dto.getMenuParentNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getMenuUrl() != null ? dto.getMenuUrl() : "");
                    dataRow.createCell(c++).setCellValue(dto.getOrderNo() != null ? dto.getOrderNo() : 0);
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
