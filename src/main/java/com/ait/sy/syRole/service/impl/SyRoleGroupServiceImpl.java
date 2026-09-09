package com.ait.sy.syRole.service.impl;

import com.ait.sy.syRole.dto.SyRoleGroupDto;
import com.ait.sy.syRole.mapper.SyRoleGroupMapper;
import com.ait.sy.syRole.mapper.SyRoleGroupRelationMapper;
import com.ait.sy.syRole.model.SyRoleGroup;
import com.ait.sy.syRole.model.SyRoleGroupRelation;
import com.ait.sy.syRole.service.SyRoleGroupService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SyRoleGroupServiceImpl implements SyRoleGroupService {

    @Autowired
    private SyRoleGroupMapper syRoleGroupMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Autowired
    private SyRoleGroupRelationMapper syRoleGroupRelationMapper;

    @Override
    public List<SyRoleGroupDto> findAll(String keyword) {
        return syRoleGroupMapper.findAll(keyword);
    }

    @Override
    public SyRoleGroupDto findByRoleGroupNo(String roleGroupNo) {
        SyRoleGroup group = syRoleGroupMapper.findByRoleGroupNo(roleGroupNo);
        if (group == null)
            return null;

        SyRoleGroupDto dto = new SyRoleGroupDto();
        BeanUtils.copyProperties(group, dto);

        // Fetch names
        dto.setNameVi(syGlobalNameMapper.getContentByNoAndLanguage(roleGroupNo, "vi"));
        dto.setNameEn(syGlobalNameMapper.getContentByNoAndLanguage(roleGroupNo, "en"));
        dto.setNameZh(syGlobalNameMapper.getContentByNoAndLanguage(roleGroupNo, "zh"));
        dto.setNameKo(syGlobalNameMapper.getContentByNoAndLanguage(roleGroupNo, "ko"));

        // Fetch Relations (Role IDs)
        List<SyRoleGroupRelation> relations = syRoleGroupRelationMapper.findByRoleGroupNo(roleGroupNo);
        List<String> roleNos = relations.stream()
                .map(SyRoleGroupRelation::getRoleNo)
                .collect(Collectors.toList());
        dto.setRoleNos(roleNos);

        return dto;
    }

    @Override
    @Transactional
    public void save(SyRoleGroupDto dto) {
        String seqId = dto.getRoleGroupNo();
        boolean isNew = (seqId == null || seqId.isEmpty());

        if (isNew) {
            seqId = syRoleGroupMapper.getNextGlobalNoSeq();
            dto.setRoleGroupNo(seqId);
            dto.setRoleGroupId(seqId);
        }

        SyRoleGroup roleGroup = new SyRoleGroup();
        roleGroup.setRoleGroupNo(seqId);
        roleGroup.setRoleGroupId(seqId);
        roleGroup.setCpnyId(dto.getCpnyId());
        roleGroup.setJoinDefault(dto.getJoinDefault() == null ? 0 : dto.getJoinDefault());
        roleGroup.setSysType(dto.getSysType() == null ? 0 : dto.getSysType());
        roleGroup.setOrderNo(dto.getOrderNo() == null ? 0 : dto.getOrderNo());
        roleGroup.setActivity(dto.getActivity() == null ? 1 : dto.getActivity());

        if (isNew) {
            syRoleGroupMapper.insert(roleGroup);
        } else {
            roleGroup.setRoleGroupNo(dto.getRoleGroupNo());
            roleGroup.setRoleGroupId(dto.getRoleGroupId());
            syRoleGroupMapper.update(roleGroup);
        }

        // Save Names
        if (seqId != null) {
            saveGlobalName(seqId, "vi", dto.getNameVi());
            saveGlobalName(seqId, "en", dto.getNameEn());
            saveGlobalName(seqId, "zh", dto.getNameZh());
            saveGlobalName(seqId, "ko", dto.getNameKo());
        }

    }

    @Override
    @Transactional
    public void saveRelations(String roleGroupNo, List<String> roleNos) {
        if (roleGroupNo == null || roleGroupNo.isEmpty())
            return;

        // 1. Delete old
        syRoleGroupRelationMapper.deleteByRoleGroupNo(roleGroupNo);

        // 2. Insert new
        if (roleNos != null && !roleNos.isEmpty()) {
            for (String roleNo : roleNos) {
                SyRoleGroupRelation rel = new SyRoleGroupRelation();
                rel.setRoleGroupNo(roleGroupNo);
                rel.setRoleNo(roleNo);
                rel.setOrderNo(0);
                rel.setActivity(1);
                syRoleGroupRelationMapper.insert(rel);
            }
        }
    }

    private void saveGlobalName(String no, String lang, String content) {
        if (content == null)
            content = "";
        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);
        if (existing != null) {
            existing.setContent(content);
            if (!"1".equals(existing.getActivity()))
                existing.setActivity("1");
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName gn = new SyGlobalName();
            gn.setNo(no);
            gn.setLanguage(lang);
            gn.setContent(content);
            gn.setActivity("1");
            gn.setOrderNo(0);
            syGlobalNameMapper.insert(gn);
        }
    }

    @Override
    @Transactional
    public void delete(String roleGroupId) {
        if (roleGroupId != null) {
            // Delete names
            syGlobalNameMapper.deleteByNo(roleGroupId); // Assuming deleteByNo exists/works

            // Delete relations
            syRoleGroupRelationMapper.deleteByRoleGroupNo(roleGroupId);

            // Delete group (Logical delete with audit)
            syRoleGroupMapper.deleteByRoleGroupId(roleGroupId);
        }
    }

    @Override
    public byte[] exportExcel() {
        try {
            List<SyRoleGroupDto> list = syRoleGroupMapper.findAll(null);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_ROLE_GROUP");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList(
                        "RoleGroup ID", "Name (VI)", "Name (EN)", "Name (ZH)", "Name (KO)", "System Type", "Join Default");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyRoleGroupDto dto : list) {
                    XSSFRow dataRow = sheet.createRow(rowIdx++);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(dto.getRoleGroupId() != null ? dto.getRoleGroupId() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameVi() != null ? dto.getNameVi() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameEn() != null ? dto.getNameEn() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameZh() != null ? dto.getNameZh() : "");
                    dataRow.createCell(c++).setCellValue(dto.getNameKo() != null ? dto.getNameKo() : "");
                    dataRow.createCell(c++).setCellValue(dto.getSysType() != null && dto.getSysType() == 0 ? "Hub" : "Partner");
                    dataRow.createCell(c++).setCellValue(dto.getJoinDefault() != null && dto.getJoinDefault() == 1 ? "Yes" : "No");
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
