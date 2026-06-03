package com.ait.org.orgManage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.org.orgManage.model.OrgInfo;

import java.util.List;
import java.util.Map;

@Mapper
public interface OrgInfoMapper {
    List<OrgInfo> getOrgList(@Param("resumeNo") String resumeNo);

    OrgInfo getOrgDetail(@Param("resumeNo") String resumeNo, @Param("deptNo") String deptNo);

    int insertOrgInfo(OrgInfo orgInfo);

    int updateOrgInfo(OrgInfo orgInfo);

    int deleteOrgInfo(@Param("resumeNo") String resumeNo, @Param("deptNo") String deptNo);

    List<Map<String, Object>> getDeptManagerCheckList(@Param("resumeNo") String resumeNo);

    int updateOrgManager(@Param("resumeNo") String resumeNo, @Param("deptNo") String deptNo,
            @Param("managerEmpId") String managerEmpId, @Param("isPartTime") String isPartTime);
}
