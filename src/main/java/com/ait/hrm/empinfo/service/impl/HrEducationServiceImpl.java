package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrEducationMapper;
import com.ait.hrm.empinfo.model.HrEducation;
import com.ait.hrm.empinfo.service.HrEducationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HrEducationServiceImpl implements HrEducationService {

    @Autowired
    private HrEducationMapper hrEducationMapper;

    @Override
    public List<HrEducation> searchEducation(String empId, String personId, String localName, String institutionName) {
        return hrEducationMapper.searchEducation(empId, personId, localName, institutionName);
    }

    @Override
    public HrEducation getById(Long educNo) {
        return hrEducationMapper.getById(educNo);
    }

    @Override
    @Transactional
    public boolean saveEducation(HrEducation info, boolean isNew) {
        if (isNew) {
            // Thiết lập giá trị mặc định nếu cần
            if (info.getActivity() == null)
                info.setActivity(1);
            return hrEducationMapper.insert(info) > 0;
        } else {
            return hrEducationMapper.update(info) > 0;
        }
    }

    @Override
    @Transactional
    public boolean deleteEducation(Long educNo) {
        return hrEducationMapper.delete(educNo) > 0;
    }
}
