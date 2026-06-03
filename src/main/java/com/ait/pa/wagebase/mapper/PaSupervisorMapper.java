package com.ait.pa.wagebase.mapper;

import com.ait.pa.wagebase.dto.PaSupervisorDto;
import com.ait.pa.wagebase.dto.PaSupervisorInfoDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PaSupervisorMapper {

    long countList(PaSupervisorDto params);

    List<PaSupervisorDto> selectListPage(PaSupervisorDto params);

    List<PaSupervisorDto> getAllSupervisorList();

    PaSupervisorDto selectOne(@Param("personId") String personId);

    int insert(PaSupervisorDto dto);

    int update(PaSupervisorDto dto);

    int deleteByPersonId(@Param("personId") String personId);

    int existsByPersonId(@Param("personId") String personId);

    // PA_SUPERVISOR_INFO operations
    List<Map<String, Object>> getDepartmentTree();

    List<Map<String, Object>> getAuthorizedDepartments();

    List<String> getDeptNoListByPersonId(@Param("personId") String personId);

    Long getNextSeq();

    int insertSupervisorInfo(PaSupervisorInfoDto dto);

    int deleteInfoByPersonId(@Param("personId") String personId);
}
