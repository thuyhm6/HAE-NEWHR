package com.ait.sy.syRole.service.impl;

import com.ait.sy.syRole.dto.SyUserDto;
import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.syRole.mapper.SyUserRelationMapper;
import com.ait.sy.syRole.model.SyUser;
import com.ait.sy.syRole.model.SyUserRelation;
import com.ait.sy.syRole.service.SyUserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
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
        List<SyUser> list = syUserMapper.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF'); // BOM for UTF-8
        sb.append("STT,ID Đăng nhập,Mã NV,Họ tên\n");
        int rowIndex = 1;

        for (SyUser data : list) {
            sb.append(rowIndex++).append(",");
            sb.append(escapeCsv(data.getUserNo())).append(",");
            sb.append(escapeCsv(data.getPersonId())).append(",");
            sb.append(escapeCsv(data.getUserName())).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String s) {
        if (s == null)
            return "";
        if (isPotentialFormula(s)) {
            s = "'" + s;
        }
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }

    private boolean isPotentialFormula(String value) {
        if (value.isEmpty()) {
            return false;
        }
        char firstChar = value.charAt(0);
        return firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@';
    }
}
