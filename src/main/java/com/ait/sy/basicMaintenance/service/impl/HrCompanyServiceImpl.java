package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.HrCompanyDto;
import com.ait.sy.basicMaintenance.mapper.HrCompanyMapper;
import com.ait.sy.basicMaintenance.model.HrCompany;
import com.ait.sy.basicMaintenance.service.HrCompanyService;
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
public class HrCompanyServiceImpl implements HrCompanyService {

    @Autowired
    private HrCompanyMapper hrCompanyMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<HrCompanyDto> searchCompany(String keyword) {
        return hrCompanyMapper.findAllWithNames(keyword);
    }

    @Override
    @Transactional
    public void saveCompany(HrCompanyDto dto) {
        // Check if update or insert based on CPNY_ID existence
        boolean exists = hrCompanyMapper.existsByCpnyId(dto.getCpnyId());

        String cpnyNo = dto.getCpnyNo();

        if (!exists) {
            // New record: Generate CPNY_NO
            cpnyNo = String.valueOf(hrCompanyMapper.getNextGlobalNoSeq());
            dto.setCpnyNo(cpnyNo);
        } else if (cpnyNo == null || cpnyNo.isEmpty()) {
            // Update mode but CPNY_NO is missing in DTO, retrieve it
            HrCompany existing = hrCompanyMapper.findByCpnyId(dto.getCpnyId());
            if (existing != null) {
                cpnyNo = existing.getCpnyNo();
                dto.setCpnyNo(cpnyNo);
            }
        }

        HrCompany company = new HrCompany();
        company.setCpnyId(dto.getCpnyId());
        company.setCpnyLocation(dto.getCpnyLocation());
        company.setCpnyAddr(dto.getCpnyAddr());
        company.setCpnyPostalcode(dto.getCpnyPostalcode());
        company.setCpnyIntro(dto.getCpnyIntro());
        company.setCpnyHistory(dto.getCpnyHistory());
        company.setCpnyWebAddr(dto.getCpnyWebAddr());
        company.setCpnyTelNo(dto.getCpnyTelNo());
        company.setCpnyFaxNo(dto.getCpnyFaxNo());
        company.setCpnyNo(cpnyNo);
        company.setOperationId(dto.getOperationId());
        company.setGgsYn(dto.getGgsYn());
        // activity, orderNo handled below or via DTO
        company.setActivity(dto.getActivity() == null ? "1" : dto.getActivity()); // Default active
        company.setOrderNo(dto.getOrderNo() == null ? 0 : dto.getOrderNo());

        if (exists) {
            hrCompanyMapper.update(company);
        } else {
            hrCompanyMapper.insert(company);
        }

        // Save Multilingual Names
        if (cpnyNo != null) {
            saveGlobalName(cpnyNo, "vi", dto.getNameVi());
            saveGlobalName(cpnyNo, "en", dto.getNameEn());
            saveGlobalName(cpnyNo, "zh", dto.getNameZh());
            saveGlobalName(cpnyNo, "ko", dto.getNameKo());
        }
    }

    private void saveGlobalName(String no, String lang, String content) {
        if (content == null)
            content = ""; // Allow empty? Or skip?

        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);

        if (existing != null) {
            existing.setContent(content);
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
    public void deleteCompany(String cpnyNo) {
        // Delete by cpnyNo is safest for both tables
        // But need to delete HR_COMPANY by cpnyNo (I added that method)
        if (cpnyNo != null) {
            syGlobalNameMapper.deleteByNo(cpnyNo);
            hrCompanyMapper.deleteByCpnyNo(cpnyNo);
        }
    }

    @Override
    public byte[] exportExcel() {
        try {
            List<HrCompanyDto> list = hrCompanyMapper.findAllWithNames(null);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("HR_COMPANY");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList(
                        "Company ID", "Name (VI)", "Name (EN)", "Name (ZH)", "Name (KO)", "Address", "Tel", "Web");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (HrCompanyDto dto : list) {
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getCpnyId() != null ? dto.getCpnyId() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameZh() != null ? dto.getNameZh() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameKo() != null ? dto.getNameKo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getCpnyAddr() != null ? dto.getCpnyAddr() : "");
                    dataRow.createCell(c++).setCellValue(dto.getCpnyTelNo() != null ? dto.getCpnyTelNo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getCpnyWebAddr() != null ? dto.getCpnyWebAddr() : "");
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
