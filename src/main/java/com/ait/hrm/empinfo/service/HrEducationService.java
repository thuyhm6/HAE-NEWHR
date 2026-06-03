package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrEducation;

public interface HrEducationService {
    List<HrEducation> searchEducation(String empId, String personId, String localName, String institutionName);

    HrEducation getById(Long educNo);

    boolean saveEducation(HrEducation info, boolean isNew);

    boolean deleteEducation(Long educNo);
}
