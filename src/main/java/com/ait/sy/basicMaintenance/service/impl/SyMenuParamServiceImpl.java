package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyMenuParamDto;
import com.ait.sy.basicMaintenance.mapper.SyMenuParamMapper;
import com.ait.sy.basicMaintenance.model.SyMenuParam;
import com.ait.sy.basicMaintenance.service.SyMenuParamService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
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
        List<SyMenuParamDto> list = findByParentMenuAndCpny(parentMenuNo, cpnyId);
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("Menu Code,Name (VI),Name (EN),Assigned,Order No,Activity\n");
        for (SyMenuParamDto dto : list) {
            sb.append(escapeCsv(dto.getMenuCode())).append(",");
            sb.append(escapeCsv(dto.getNameVi())).append(",");
            sb.append(escapeCsv(dto.getNameEn())).append(",");
            sb.append(dto.isAssigned() ? "Yes" : "No").append(",");
            sb.append(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : "").append(",");
            sb.append(dto.getParamActivity() != null ? dto.getParamActivity() : "").append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String s) {
        if (s == null)
            return "";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
