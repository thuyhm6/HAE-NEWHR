package com.ait.org.orgManage.service.impl;

import com.ait.org.orgManage.mapper.OrgEmployeeMapper;
import com.ait.org.orgManage.mapper.OrgInfoMapper;
import com.ait.org.orgManage.model.OrgEmployee;
import com.ait.org.orgManage.model.OrgInfo;
import com.ait.org.orgManage.service.OrgStructureService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrgStructureServiceImpl implements OrgStructureService {

    @Autowired
    private OrgInfoMapper orgInfoMapper;

    @Autowired
    private OrgEmployeeMapper orgEmployeeMapper;

    @Override
    public List<OrgInfo> getOrgStructure(String resumeNo) {
        return orgInfoMapper.getOrgList(resumeNo);
    }

    @Override
    public OrgInfo getOrgDetail(String resumeNo, String deptNo) {
        return orgInfoMapper.getOrgDetail(resumeNo, deptNo);
    }

    @Override
    public List<OrgEmployee> getEmployeesByDept(String resumeNo, String deptNo) {
        return orgEmployeeMapper.getEmployeesByDept(resumeNo, deptNo);
    }

    @Override
    public int saveOrgInfo(OrgInfo orgInfo, boolean isNew) {
        if (isNew) {
            // Check if exists? For now assume valid
            return orgInfoMapper.insertOrgInfo(orgInfo);
        } else {
            return orgInfoMapper.updateOrgInfo(orgInfo);
        }
    }

    @Override
    public int deleteOrgInfo(String resumeNo, String deptNo) {
        return orgInfoMapper.deleteOrgInfo(resumeNo, deptNo);
    }

    @Override
    public void transferEmployees(String resumeNo, String targetDeptNo, List<String> empIds) {
        if (empIds != null && !empIds.isEmpty()) {
            java.util.Map<String, Object> params = new java.util.HashMap<>();
            params.put("resumeNo", resumeNo);
            params.put("targetDeptNo", targetDeptNo);
            params.put("empIds", empIds);
            orgEmployeeMapper.updateEmployeeDept(params);
        }
    }

    @Override
    public List<java.util.Map<String, Object>> getDeptManagerCheckList(String resumeNo) {
        return orgInfoMapper.getDeptManagerCheckList(resumeNo);
    }

    @Override
    public int updateOrgManager(String resumeNo, String deptNo, String managerEmpId, String isPartTime) {
        return orgInfoMapper.updateOrgManager(resumeNo, deptNo, managerEmpId, isPartTime);
    }
}
