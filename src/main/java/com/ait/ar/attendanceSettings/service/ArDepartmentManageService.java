package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArDepartmentManageDto;
import com.ait.ar.attendanceSettings.model.ArDepartmentManage;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface ArDepartmentManageService {
    List<ArDepartmentManageDto> getDepartmentManageList(String lockDate, String deptNo, HttpServletRequest request);

    void saveDepartmentManage(List<ArDepartmentManage> locks, HttpServletRequest request);
}
