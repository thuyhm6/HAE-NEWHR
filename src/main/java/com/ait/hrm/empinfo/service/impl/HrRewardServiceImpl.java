package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrRewardMapper;
import com.ait.hrm.empinfo.model.HrReward;
import com.ait.hrm.empinfo.service.HrRewardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class HrRewardServiceImpl implements HrRewardService {

    @Autowired
    private HrRewardMapper hrRewardMapper;

    @Override
    public List<HrReward> searchReward(String empId, String localName, String rewardType) {
        return hrRewardMapper.searchReward(empId, localName, rewardType);
    }

    @Override
    public List<HrReward> getByPersonId(String personId) {
        return hrRewardMapper.getByPersonId(personId);
    }

    @Override
    public HrReward getById(Long rewardNo) {
        return hrRewardMapper.getById(rewardNo);
    }

    @Override
    @Transactional
    public boolean saveReward(HrReward info, boolean isNew) {
        if (isNew) {
            info.setActivity(1);
            return hrRewardMapper.insert(info) > 0;
        } else {
            return hrRewardMapper.update(info) > 0;
        }
    }

    @Override
    @Transactional
    public boolean deleteReward(Long rewardNo) {
        return hrRewardMapper.delete(rewardNo) > 0;
    }
}
