package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArOverTimeLimitMapper {

    List<ArOverTimeLimitDto> selectOverTimeLimitList(ArOverTimeLimitDto params);

    int updateOverTimeLimit(@Param("otLimitNo") String otLimitNo,
                            @Param("otLimitMonth") String otLimitMonth,
                            @Param("otLimitYear") String otLimitYear);

    String selectPersonIdByEmpId(@Param("empId") String empId);

    int updateEmployeeOtLimit(@Param("personId") String personId,
                              @Param("otLimit") Integer otLimit,
                              @Param("otLimit100") Integer otLimit100);
}
