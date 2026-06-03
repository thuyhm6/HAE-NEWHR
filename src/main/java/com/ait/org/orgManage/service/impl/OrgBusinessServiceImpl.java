package com.ait.org.orgManage.service.impl;

import com.ait.org.orgManage.mapper.OrgBusinessRelationMapper;
import com.ait.org.orgManage.model.OrgBusinessRelation;
import com.ait.org.orgManage.service.OrgBusinessService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class OrgBusinessServiceImpl implements OrgBusinessService {

    @Autowired
    private OrgBusinessRelationMapper mapper;

    @Override
    public List<OrgBusinessRelation> getList(String resumeNo, String deptNo) {
        return mapper.selectByDept(resumeNo, deptNo);
    }

    @Override
    @Transactional
    public int save(OrgBusinessRelation obj) {
        if (obj.getSeq() == null || obj.getSeq().isEmpty()) {
            return mapper.insert(obj);
        } else {
            return mapper.update(obj);
        }
    }

    @Override
    @Transactional
    public int delete(String seq) {
        return mapper.delete(seq);
    }
}
