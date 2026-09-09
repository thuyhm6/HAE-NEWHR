package com.ait.sy.syRole.service.impl;

import com.ait.sy.syRole.dto.SyUserDto;
import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.syRole.mapper.SyUserRelationMapper;
import com.ait.sy.syRole.model.SyUser;
import com.ait.sy.syRole.model.SyUserRelation;
import com.ait.sy.syRole.service.SyUserService;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SyUserServiceImpl implements SyUserService {

    @Autowired
    private SyUserMapper syUserMapper;

    @Autowired
    private SyUserRelationMapper syUserRelationMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<SyUserDto> searchUsers(String keyword) {
        List<SyUser> users = syUserMapper.searchUsers(keyword);
        return users.stream().map(u -> {
            SyUserDto dto = new SyUserDto();
            dto.setUserNo(u.getUserNo());
            dto.setPersonId(u.getPersonId());
            dto.setCpnyId(u.getCpnyId());
            dto.setUserName(u.getUserName());
            dto.setUserType(u.getUserType());
            dto.setActivity(u.getActivity());
            dto.setEmpName(u.getEmpName());
            dto.setDeptName(u.getDeptName());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public SyUserDto findByUserNo(String userNo) {
        SyUser u = syUserMapper.findByUserNo(userNo);
        if (u == null)
            return null;

        SyUserDto dto = new SyUserDto();
        dto.setUserNo(u.getUserNo());
        dto.setPersonId(u.getPersonId());
        dto.setCpnyId(u.getCpnyId());
        dto.setUserName(u.getUserName());
        dto.setUserType(u.getUserType());
        dto.setActivity(u.getActivity());
        dto.setEmpName(u.getEmpName());
        dto.setDeptName(u.getDeptName());

        // Get relations
        List<SyUserRelation> relations = syUserRelationMapper.findByUserNo(userNo);
        if (relations != null) {
            dto.setRoleGroupNos(relations.stream()
                    .map(SyUserRelation::getRoleGroupNo)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    @Override
    @Transactional
    public void saveRelations(String userNo, List<String> roleGroupNos) {
        if (userNo == null || userNo.isEmpty())
            return;

        syUserRelationMapper.deleteByUserNo(userNo);

        if (roleGroupNos != null && !roleGroupNos.isEmpty()) {
            for (String roleGroupNo : roleGroupNos) {
                SyUserRelation rel = new SyUserRelation();
                rel.setUserNo(userNo);
                rel.setRoleGroupNo(roleGroupNo);
                rel.setOrderNo(0);
                rel.setActivity(1);
                syUserRelationMapper.insert(rel);
            }
        }
    }

    @Override
    public void resetPassword(String userNo, String newPassword) {
        // Encript the password
        String encrypted = passwordEncoder.encode(newPassword);
        syUserMapper.updatePassword(userNo, encrypted);
    }

    @Override
    public byte[] exportExcel() {
        try {
            List<SyUserDto> list = searchUsers(null);

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                XSSFSheet sheet = wb.createSheet("SY_USER");

                CellStyle headerStyle = wb.createCellStyle();
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                List<String> headers = Arrays.asList("STT", "ID Đăng nhập", "Họ tên", "Phòng ban", "Mã NV", "Loại TK");
                XSSFRow headerRow = sheet.createRow(0);
                for (int col = 0; col < headers.size(); col++) {
                    XSSFCell cell = headerRow.createCell(col);
                    cell.setCellValue(headers.get(col));
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (SyUserDto dto : list) {
                    XSSFRow dataRow = sheet.createRow(rowIdx);
                    int c = 0;
                    dataRow.createCell(c++).setCellValue(rowIdx);
                    dataRow.createCell(c++).setCellValue(dto.getUserName() != null ? dto.getUserName() : "");
                    dataRow.createCell(c++).setCellValue(dto.getEmpName() != null ? dto.getEmpName() : "");
                    dataRow.createCell(c++).setCellValue(dto.getDeptName() != null ? dto.getDeptName() : "");
                    dataRow.createCell(c++).setCellValue(dto.getPersonId() != null ? dto.getPersonId() : "");
                    dataRow.createCell(c++).setCellValue(dto.getUserType() != null ? dto.getUserType() : "");
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
            throw new RuntimeException(e);
        }
    }
}
