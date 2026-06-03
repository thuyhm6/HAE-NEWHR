package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrWorkExperienceMapper;
import com.ait.hrm.empinfo.model.HrWorkExperience;
import com.ait.hrm.empinfo.service.HrWorkExperienceService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional
public class HrWorkExperienceServiceImpl implements HrWorkExperienceService {
    private static final Logger log = LoggerFactory.getLogger(HrWorkExperienceServiceImpl.class);

    @Autowired
    private HrWorkExperienceMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<HrWorkExperience> getByPersonId(String personId) {
        return mapper.getByPersonId(personId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrWorkExperience> searchWorkExperience(String empId, String localName, String companyName) {
        return mapper.searchWorkExperience(empId, localName, companyName);
    }

    @Override
    public boolean saveWorkExperience(HrWorkExperience info, boolean isNew) {
        try {
            if (isNew || info.getWorkExpNo() == null) {
                // Assuming database sequence handles ID generation
                return mapper.insert(info) > 0;
                //
                //
                //
                //
            } else {
                return mapper.update(info) > 0;
            }
        } catch (Exception e) {
            log.error("Failed to save work experience workExpNo={}", info.getWorkExpNo(), e);
            return false;
        }
    }

    @Override
    public boolean deleteWorkExperience(Long workExpNo) {
        return mapper.delete(workExpNo) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public HrWorkExperience getById(Long workExpNo) {
        return mapper.getById(workExpNo);
    }
}
