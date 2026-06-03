package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArSupervisorDto;
import com.ait.ar.attendanceSettings.model.ArSupervisor;
import com.ait.ar.attendanceSettings.model.ArSupervisorInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface ArSupervisorMapper {
    // 1. Employee list for Supervisor (Left Pane)
    List<ArSupervisorDto> getAllSupervisors();

    ArSupervisor selectSupervisorByPersonId(@Param("personId") String personId);

    int insertSupervisor(ArSupervisor model);

    int updateSupervisor(ArSupervisor model);

    int deleteSupervisor(@Param("personId") String personId);

    // 2. Department hierarchy mapped with hr_department
    List<Map<String, Object>> getDepartmentTree();

    List<Map<String, Object>> getAuthorizedDepartments();

    // 3. Supervisor Info management (Right Pane configuration)
    List<String> getDeptListByPersonId(@Param("personId") String personId);

    int insertSupervisorInfo(ArSupervisorInfo model);

    int deleteSupervisorInfoByPersonId(@Param("personId") String personId);

    Long getNextSupervisorNoSeq();
}
