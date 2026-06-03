package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrAddressMatters;

public interface HrAddressMattersService {
    List<HrAddressMatters> searchAddress(String empId, String personId, String localName, String addressContent);

    HrAddressMatters getById(Long addressNo);

    boolean saveAddress(HrAddressMatters info, boolean isNew);

    boolean deleteAddress(Long addressNo);
}
