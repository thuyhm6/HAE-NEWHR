package com.ait.ess.empinfo.service.impl;

import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;
import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.hrm.empinfo.mapper.HrAddressMattersMapper;
import com.ait.hrm.empinfo.mapper.HrEmergencyAddressMapper;
import com.ait.hrm.empinfo.mapper.HrFamilyMapper;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EssPersonalInfoServiceImpl implements EssPersonalInfoService {

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Autowired
    private HrAddressMattersMapper addressMapper;

    @Autowired
    private HrFamilyMapper familyMapper;

    @Autowired
    private HrEmergencyAddressMapper emergencyMapper;

    @Override
    public EssPersonalInfoDto getMyInfo(String personId) {
        return essPersonalInfoMapper.findMyInfo(personId);
    }

    @Override
    public List<HrAddressMatters> getMyAddresses(String personId) {
        
        // Tận dụng mapper có sẵn searchAddress bằng personId
        return addressMapper.searchAddress(null, personId, null, null);
    }

    @Override
    public List<HrFamily> getMyFamilies(String personId) {
        // Tận dụng mapper có sẵn searchFamily bằng personId
        return familyMapper.searchFamily(null, personId, null, null);
    }

    @Override
    public List<HrEmergencyAddress> getMyEmergencies(String personId) {
        // Tận dụng mapper có sẵn searchEmergencyAddress bằng personId
        return emergencyMapper.searchEmergencyAddress(null, personId, null, null);
    }
}
