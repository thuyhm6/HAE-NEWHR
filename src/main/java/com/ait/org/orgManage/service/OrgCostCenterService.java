package com.ait.org.orgManage.service;

import java.util.List;

import com.ait.org.orgManage.model.OrgCostCenter;

public interface OrgCostCenterService {
    List<OrgCostCenter> getList(String codeNo, String codeName);

    OrgCostCenter getDetail(String seq);

    int save(OrgCostCenter obj);

    int delete(String seq);
}
