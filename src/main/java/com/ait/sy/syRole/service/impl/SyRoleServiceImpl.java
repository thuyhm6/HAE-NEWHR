package com.ait.sy.syRole.service.impl;

import com.ait.sy.syRole.dto.SyRoleDto;
import com.ait.sy.syRole.mapper.SyRoleMapper;
import com.ait.sy.syRole.mapper.SyRoleRelationMapper;
import com.ait.sy.syRole.model.SyRole;
import com.ait.sy.syRole.model.SyRoleRelation;
import com.ait.sy.syRole.service.SyRoleService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SyRoleServiceImpl implements SyRoleService {

    @Autowired
    private SyRoleMapper syRoleMapper;

    @Autowired
    private SyRoleRelationMapper syRoleRelationMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<SyRoleDto> findAll(String keyword) {
        return syRoleMapper.findAllWithNames(keyword);
    }

    @Override
    public SyRoleDto findById(String roleNo) {
        SyRole role = syRoleMapper.findByRoleNo(roleNo);
        if (role == null)
            return null;

        SyRoleDto dto = new SyRoleDto();
        BeanUtils.copyProperties(role, dto);

        // Fetch names
        dto.setNameVi(syGlobalNameMapper.getContentByNoAndLanguage(roleNo, "vi"));
        dto.setNameEn(syGlobalNameMapper.getContentByNoAndLanguage(roleNo, "en"));
        dto.setNameZh(syGlobalNameMapper.getContentByNoAndLanguage(roleNo, "zh"));
        dto.setNameKo(syGlobalNameMapper.getContentByNoAndLanguage(roleNo, "ko"));

        // Fetch relations
        List<SyRoleRelation> relations = syRoleRelationMapper.findByRoleNo(roleNo);
        dto.setRoleRelations(relations);

        return dto;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void save(SyRoleDto dto) throws Exception {
        boolean isNew = dto.getRoleNo() == null || dto.getRoleNo().isEmpty();
        String roleNo;

        if (isNew) {
            // Generate ID from sequence
            roleNo = syRoleMapper.getNextVal();

            SyRole role = new SyRole();
            BeanUtils.copyProperties(dto, role);

            role.setRoleNo(roleNo);
            // "lưu ý trường ROLE_NO và ROLE_ID khi tạo mới là tự động tăng với giá trị
            // trường SEQ"
            role.setRoleId(roleNo);

            // Set defaults if null
            if (role.getActivity() == null)
                role.setActivity(1);
            if (role.getOrderNo() == null)
                role.setOrderNo(0);

            syRoleMapper.insert(role);
        } else {
            roleNo = dto.getRoleNo();
            SyRole role = syRoleMapper.findByRoleNo(roleNo);
            if (role != null) {
                // Update basic fields
                role.setOrderNo(dto.getOrderNo());
                role.setActivity(dto.getActivity());
                role.setSysType(dto.getSysType());
                syRoleMapper.update(role);
            }
        }

        // Handle Multilingual Names
        saveGlobalName(roleNo, "vi", dto.getNameVi(), dto.getActivity(), dto.getOrderNo());
        saveGlobalName(roleNo, "en", dto.getNameEn(), dto.getActivity(), dto.getOrderNo());
        saveGlobalName(roleNo, "zh", dto.getNameZh(), dto.getActivity(), dto.getOrderNo());
        saveGlobalName(roleNo, "ko", dto.getNameKo(), dto.getActivity(), dto.getOrderNo());

        // Handle Role Relations
        // Strategy: Delete all existing relations for this role, then insert new ones.
        syRoleRelationMapper.deleteByRoleNo(roleNo);

        if (dto.getRoleRelations() != null && !dto.getRoleRelations().isEmpty()) {
            for (SyRoleRelation rel : dto.getRoleRelations()) {
                rel.setRoleNo(roleNo);
                // Ensure Created/Updated BY are set
                if (rel.getActivity() == null)
                    rel.setActivity(1);
                if (rel.getOrderNo() == null)
                    rel.setOrderNo(0);

                // Ensure we have MENU_NO
                if (rel.getMenuNo() != null && !rel.getMenuNo().isEmpty()) {
                    syRoleRelationMapper.insert(rel);
                }
            }
        }
    }

    private void saveGlobalName(String no, String language, String content, Integer activity,
            Integer orderNo) {
        // Find existing to get SEQ
        boolean exists = syGlobalNameMapper.existsByNoAndLanguage(no, language);
        String actStr = (activity != null) ? activity.toString() : "1";

        if (exists) {
            SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, language);
            if (existing != null) {
                existing.setContent(content == null ? "" : content);
                existing.setActivity(actStr);
                existing.setOrderNo(orderNo);
                syGlobalNameMapper.update(existing);
            }
        } else {
            SyGlobalName gn = new SyGlobalName();
            gn.setNo(no);
            gn.setLanguage(language);
            gn.setContent(content == null ? "" : content);
            gn.setActivity(actStr);
            gn.setOrderNo(orderNo);
            // Insert triggers selectKey for SEQ
            syGlobalNameMapper.insert(gn);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String roleNo) throws Exception {
        // Delete Relations FIRST (Foreign key)
        syRoleRelationMapper.deleteByRoleNo(roleNo);

        // Delete Global Names
        syGlobalNameMapper.deleteByNo(roleNo);

        // Delete Role
        syRoleMapper.deleteByRoleNo(roleNo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveRelations(SyRoleDto dto) throws Exception {
        String roleNo = dto.getRoleNo();
        if (roleNo == null || roleNo.isEmpty()) {
            throw new Exception("Role No is required");
        }

        // Strategy: Delete all existing relations for this role, then insert new ones.
        syRoleRelationMapper.deleteByRoleNo(roleNo);

        if (dto.getRoleRelations() != null && !dto.getRoleRelations().isEmpty()) {
            for (SyRoleRelation rel : dto.getRoleRelations()) {
                rel.setRoleNo(roleNo);
                // Ensure Created/Updated BY are set
                if (rel.getActivity() == null)
                    rel.setActivity(1);
                if (rel.getOrderNo() == null)
                    rel.setOrderNo(0);

                // Ensure we have MENU_NO
                if (rel.getMenuNo() != null && !rel.getMenuNo().isEmpty()) {
                    syRoleRelationMapper.insert(rel);
                }
            }
        }
    }

    @Override
    public byte[] exportExcel() {
        List<SyRoleDto> list = syRoleMapper.findAllWithNames("");
        StringBuilder csv = new StringBuilder();
        csv.append("Role No,Role ID,Name VI,Name EN,Name ZH,Name KO,CPNY ID,System Type,Activity,Order No\n");

        for (SyRoleDto dto : list) {
            csv.append(escapeCsv(dto.getRoleNo())).append(",");
            csv.append(escapeCsv(dto.getRoleId())).append(",");
            csv.append(escapeCsv(dto.getNameVi())).append(",");
            csv.append(escapeCsv(dto.getNameEn())).append(",");
            csv.append(escapeCsv(dto.getNameZh())).append(",");
            csv.append(escapeCsv(dto.getNameKo())).append(",");
            csv.append(escapeCsv(dto.getCpnyId())).append(",");
            csv.append(dto.getSysType()).append(",");
            csv.append(dto.getActivity()).append(",");
            csv.append(dto.getOrderNo()).append("\n");
        }

        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {

        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
