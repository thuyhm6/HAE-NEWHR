package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrEmergencyAddressMapper;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.service.HrEmergencyAddressService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HrEmergencyAddressServiceImpl implements HrEmergencyAddressService {

    @Autowired
    private HrEmergencyAddressMapper hrEmergencyAddressMapper;

    @Override
    public List<HrEmergencyAddress> searchEmergencyAddress(String empId, String personId, String localName, String emerName) {
        return hrEmergencyAddressMapper.searchEmergencyAddress(empId, personId, localName, emerName);
    }

    @Override
    public HrEmergencyAddress getById(Long emergencyNo) {
        return hrEmergencyAddressMapper.getById(emergencyNo);
    }

    @Override
    @Transactional
    public boolean saveEmergencyAddress(HrEmergencyAddress info, boolean isNew) {
        if (isNew) {
            info.setActivity(1);
            return hrEmergencyAddressMapper.insert(info) > 0;
        } else {
            return hrEmergencyAddressMapper.update(info) > 0;
        }
    }

    @Override
    @Transactional
    public boolean deleteEmergencyAddress(Long emergencyNo) {
        return hrEmergencyAddressMapper.delete(emergencyNo) > 0;
    }
}
