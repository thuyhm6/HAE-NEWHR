package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArSupervisorDto;
import com.ait.ar.attendanceSettings.model.ArSupervisor;
import java.util.List;
import java.util.Map;

public interface ArSupervisorService {
    List<ArSupervisorDto> getAllSupervisors();

    ArSupervisor getSupervisorByPersonId(String personId);

    void saveSupervisor(ArSupervisor model);

    void deleteSupervisor(String personId);

    List<Map<String, Object>> getDepartmentTree();

    List<String> getDeptListByPersonId(String personId);

    void saveSupervisorInfo(String personId, List<String> deptNoList);

    List<Map<String, Object>> getAuthorizedDepartments();
}
