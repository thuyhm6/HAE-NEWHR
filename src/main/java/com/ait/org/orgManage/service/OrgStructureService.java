package com.ait.org.orgManage.service;

import java.util.List;

import com.ait.org.orgManage.model.OrgEmployee;
import com.ait.org.orgManage.model.OrgInfo;

public interface OrgStructureService {
    List<OrgInfo> getOrgStructure(String resumeNo);

    OrgInfo getOrgDetail(String resumeNo, String deptNo);

    List<OrgEmployee> getEmployeesByDept(String resumeNo, String deptNo);

    int saveOrgInfo(OrgInfo orgInfo, boolean isNew);

    int deleteOrgInfo(String resumeNo, String deptNo);

    void transferEmployees(String resumeNo, String targetDeptNo, List<String> empIds);

    List<java.util.Map<String, Object>> getDeptManagerCheckList(String resumeNo);

    int updateOrgManager(String resumeNo, String deptNo, String managerEmpId, String isPartTime);
}
