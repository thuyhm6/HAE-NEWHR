package com.ait.org.orgManage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.org.orgManage.model.OrgEmployee;

import java.util.List;
import java.util.Map;

@Mapper
public interface OrgEmployeeMapper {
    List<OrgEmployee> getEmployeesByDept(@Param("resumeNo") String resumeNo, @Param("deptNo") String deptNo);

    int updateEmployeeDept(Map<String, Object> params);

    // Additional methods based on requirement
}
