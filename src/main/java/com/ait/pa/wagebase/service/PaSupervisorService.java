package com.ait.pa.wagebase.service;

import com.ait.pa.wagebase.dto.PaSupervisorDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface PaSupervisorService {

    DataTablesResponse<PaSupervisorDto> getPagedList(PaSupervisorDto params);

    List<PaSupervisorDto> getAllSupervisorList();

    PaSupervisorDto getOne(String personId);

    void save(PaSupervisorDto dto);

    void deleteList(List<String> personIds);

    List<Map<String, Object>> getDepartmentTree();

    List<Map<String, Object>> getAuthorizedDepartments();

    List<String> getDeptNoListByPersonId(String personId);

    void saveSupervisorDepts(String personId, List<String> deptNoList);

    void deleteSupervisorWithInfo(String personId);
}
