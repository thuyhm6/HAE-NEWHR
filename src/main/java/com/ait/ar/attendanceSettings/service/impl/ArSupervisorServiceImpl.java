package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArSupervisorDto;
import com.ait.ar.attendanceSettings.mapper.ArSupervisorMapper;
import com.ait.ar.attendanceSettings.model.ArSupervisor;
import com.ait.ar.attendanceSettings.model.ArSupervisorInfo;
import com.ait.ar.attendanceSettings.service.ArSupervisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ArSupervisorServiceImpl implements ArSupervisorService {

    @Autowired
    private ArSupervisorMapper mapper;

    @Override
    public List<ArSupervisorDto> getAllSupervisors() {
        return mapper.getAllSupervisors();
    }

    @Override
    public ArSupervisor getSupervisorByPersonId(String personId) {
        return mapper.selectSupervisorByPersonId(personId);
    }

    @Override
    public void saveSupervisor(ArSupervisor model) {
        ArSupervisor existing = mapper.selectSupervisorByPersonId(model.getPersonId());
        if (existing == null) {
            mapper.insertSupervisor(model);
        } else {
            mapper.updateSupervisor(model);
        }
    }

    @Override
    public void deleteSupervisor(String personId) {
        // Delete child details first
        mapper.deleteSupervisorInfoByPersonId(personId);
        // Delete father supervisor
        mapper.deleteSupervisor(personId);
    }

    @Override
    public List<Map<String, Object>> getDepartmentTree() {
        return mapper.getDepartmentTree();
    }

    @Override
    public List<String> getDeptListByPersonId(String personId) {
        return mapper.getDeptListByPersonId(personId);
    }

    @Override
    public void saveSupervisorInfo(String personId, List<String> deptNoList) {
        // Clear all previous config
        mapper.deleteSupervisorInfoByPersonId(personId);

        if (deptNoList == null || deptNoList.isEmpty()) {
            return; // Config deleted.
        }

        // Insert new selected deps
        for (String deptNo : deptNoList) {
            ArSupervisorInfo info = new ArSupervisorInfo();
            info.setArSupervisorNo(mapper.getNextSupervisorNoSeq());
            info.setPersonId(personId);
            info.setDeptno(deptNo);
            info.setActivity(1);
            info.setOrderno(1);
            mapper.insertSupervisorInfo(info);
        }
    }

    @Override
    public List<Map<String, Object>> getAuthorizedDepartments() {
        return mapper.getAuthorizedDepartments();
    }
}
