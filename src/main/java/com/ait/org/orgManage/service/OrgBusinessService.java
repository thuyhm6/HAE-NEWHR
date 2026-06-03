package com.ait.org.orgManage.service;

import java.util.List;

import com.ait.org.orgManage.model.OrgBusinessRelation;

public interface OrgBusinessService {
    List<OrgBusinessRelation> getList(String resumeNo, String deptNo);

    int save(OrgBusinessRelation obj);

    int delete(String seq);
}
