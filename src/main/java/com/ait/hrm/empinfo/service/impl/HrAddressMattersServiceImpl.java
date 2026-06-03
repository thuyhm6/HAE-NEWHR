package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrAddressMattersMapper;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.service.HrAddressMattersService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HrAddressMattersServiceImpl implements HrAddressMattersService {

    @Autowired
    private HrAddressMattersMapper hrAddressMattersMapper;

    @Override
    public List<HrAddressMatters> searchAddress(String empId, String personId, String localName, String addressContent) {
        return hrAddressMattersMapper.searchAddress(empId, personId, localName, addressContent);
    }

    @Override
    public HrAddressMatters getById(Long addressNo) {
        return hrAddressMattersMapper.getById(addressNo);
    }

    @Override
    @Transactional
    public boolean saveAddress(HrAddressMatters info, boolean isNew) {
        if (isNew) {
            // Thiết lập giá trị mặc định nếu cần
            if (info.getActivity() == null)
                info.setActivity(1);
            return hrAddressMattersMapper.insert(info) > 0;
        } else {
            return hrAddressMattersMapper.update(info) > 0;
        }
    }

    @Override
    @Transactional
    public boolean deleteAddress(Long addressNo) {
        return hrAddressMattersMapper.delete(addressNo) > 0;
    }
}
