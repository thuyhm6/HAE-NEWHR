package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrFamily;

public interface HrFamilyService {
    List<HrFamily> searchFamily(String empId, String personId, String localName, String famName);

    HrFamily getById(Long familyNo);

    boolean saveFamily(HrFamily info, boolean isNew);

    boolean deleteFamily(Long familyNo);
}
