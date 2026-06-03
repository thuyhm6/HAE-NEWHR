package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrPersonalInfoMapper;
import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.hrm.empinfo.service.HrPersonalInfoService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * HrPersonalInfoServiceImpl - Implementation của HrPersonalInfoService
 */
@Service
public class HrPersonalInfoServiceImpl implements HrPersonalInfoService {

    @Autowired
    private HrPersonalInfoMapper hrPersonalInfoMapper;

    @Override
    public HrPersonalInfo getPersonalInfoByPersonId(String personId) {
        if (personId == null || personId.trim().isEmpty()) {
            return null;
        }
        return hrPersonalInfoMapper.findByPersonId(personId.trim());
    }

    @Override
    public HrPersonalInfo getPersonalInfoByEmpNo(String empNo) {
        if (empNo == null || empNo.trim().isEmpty()) {
            return null;
        }
        return hrPersonalInfoMapper.findByEmpNo(empNo.trim());
    }

    @Override
    public HrPersonalInfo getPersonalInfoByUserNo(String userNo) {
        if (userNo == null || userNo.trim().isEmpty()) {
            return null;
        }
        return hrPersonalInfoMapper.findByUserNo(userNo.trim());
    }

    @Override
    public HrPersonalInfo getPersonalInfoFromHrUserInfo(HrUserInfo hrUserInfo) {
        if (hrUserInfo == null || hrUserInfo.getSyUser() == null) {
            return null;
        }
        return getPersonalInfoByUserNo(hrUserInfo.getSyUser().getUserNo());
    }

    @Override
    public boolean hasPersonalInfo(String userNo) {
        HrPersonalInfo personalInfo = getPersonalInfoByUserNo(userNo);
        return personalInfo != null;
    }

    @Override
    public boolean updatePersonalInfo(HrPersonalInfo info) {
        if (info == null || info.getPersonId() == null) return false;
        return hrPersonalInfoMapper.update(info) > 0;
    }

}
