package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrEmergencyAddress;

public interface HrEmergencyAddressService {
    List<HrEmergencyAddress> searchEmergencyAddress(String empId, String personId, String localName, String emerName);

    HrEmergencyAddress getById(Long emergencyNo);

    boolean saveEmergencyAddress(HrEmergencyAddress info, boolean isNew);

    boolean deleteEmergencyAddress(Long emergencyNo);
}
