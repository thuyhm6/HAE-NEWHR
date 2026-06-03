package com.ait.org.orgManage.service;

import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.org.orgManage.dto.OrgNode;
import com.ait.org.orgManage.model.HrDepartment;

import java.util.List;

public interface CurrentOrgService {
    List<HrDepartment> getOrgTree();

    List<HrEmployee> getEmployeeList(String deptNo);

    List<OrgNode> getVisualOrgTree();
}
