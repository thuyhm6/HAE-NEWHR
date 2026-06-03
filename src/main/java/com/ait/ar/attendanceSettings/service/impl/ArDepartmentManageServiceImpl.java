package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArDepartmentManageDto;
import com.ait.ar.attendanceSettings.mapper.ArDepartmentManageMapper;
import com.ait.ar.attendanceSettings.model.ArDepartmentManage;
import com.ait.ar.attendanceSettings.service.ArDepartmentManageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class ArDepartmentManageServiceImpl implements ArDepartmentManageService {

    @Autowired
    private ArDepartmentManageMapper mapper;

    @Override
    public List<ArDepartmentManageDto> getDepartmentManageList(String lockDate, String deptNo,
            HttpServletRequest request) {
        // Keep YYYY-MM-DD format as requested

        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("lockDate", lockDate);

        if (deptNo != null && !deptNo.isEmpty()) {
            params.put("deptNos", new java.util.ArrayList<>(java.util.Arrays.asList(deptNo.split(","))));
        }

        return mapper.getDepartmentManageList(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveDepartmentManage(List<ArDepartmentManage> locks, HttpServletRequest request) {
        for (ArDepartmentManage model : locks) {
            int count = mapper.checkExists(model.getLockDate(), model.getDeptNo());
            if (count > 0) {
                mapper.updateDeptManage(model);
            } else {
                mapper.insertDeptManage(model);
            }
        }
    }
}
