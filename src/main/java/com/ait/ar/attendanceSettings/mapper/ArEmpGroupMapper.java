package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArEmpGroupDto;
import com.ait.ar.attendanceSettings.model.ArEmpGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArEmpGroupMapper {
    List<ArEmpGroupDto> getList(Map<String, Object> params);
    ArEmpGroupDto getByPersonId(@Param("personId") String personId, @Param("groupNo") String groupNo);
    void insert(ArEmpGroup model);
    void update(ArEmpGroup model);
    void delete(@Param("personId") String personId, @Param("groupNo") String groupNo);
}
