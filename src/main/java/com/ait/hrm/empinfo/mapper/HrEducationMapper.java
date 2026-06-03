package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrEducation;

import java.util.List;

@Mapper
public interface HrEducationMapper {
    List<HrEducation> searchEducation(@Param("empId") String empId,
            @Param("personId") String personId,
            @Param("localName") String localName,
            @Param("institutionName") String institutionName);

    HrEducation getById(@Param("educNo") Long educNo);

    int insert(HrEducation info);

    int update(HrEducation info);

    int delete(@Param("educNo") Long educNo);
}
