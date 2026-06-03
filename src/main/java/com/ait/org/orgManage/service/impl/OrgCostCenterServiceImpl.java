package com.ait.org.orgManage.service.impl;

import com.ait.org.orgManage.mapper.OrgCostCenterMapper;
import com.ait.org.orgManage.model.OrgCostCenter;
import com.ait.org.orgManage.service.OrgCostCenterService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class OrgCostCenterServiceImpl implements OrgCostCenterService {

    @Autowired
    private OrgCostCenterMapper mapper;

    @Override
    public List<OrgCostCenter> getList(String codeNo, String codeName) {
        return mapper.selectList(codeNo, codeName);
    }

    @Override
    public OrgCostCenter getDetail(String seq) {
        return mapper.selectBySeq(seq);
    }

    @Override
    @Transactional
    public int save(OrgCostCenter obj) {
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
