package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrPunishmentMapper;
import com.ait.hrm.empinfo.model.HrPunishment;
import com.ait.hrm.empinfo.service.HrPunishmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class HrPunishmentServiceImpl implements HrPunishmentService {

    @Autowired
    private HrPunishmentMapper hrPunishmentMapper;

    @Override
    public List<HrPunishment> searchPunishment(String empId, String localName, String punishCode) {
        return hrPunishmentMapper.searchPunishment(empId, localName, punishCode);
    }

    @Override
    public HrPunishment getById(Long punishNo) {
        return hrPunishmentMapper.getById(punishNo);
    }

    @Override
    @Transactional
    public boolean savePunishment(HrPunishment info, boolean isNew) {
        if (isNew) {
            info.setActivity(1);
            return hrPunishmentMapper.insert(info) > 0;
        } else {
            return hrPunishmentMapper.update(info) > 0;
        }
    }

    @Override
    @Transactional
    public boolean deletePunishment(Long punishNo) {
        return hrPunishmentMapper.delete(punishNo) > 0;
    }
}
