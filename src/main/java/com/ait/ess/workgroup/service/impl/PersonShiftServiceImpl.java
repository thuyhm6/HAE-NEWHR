package com.ait.ess.workgroup.service.impl;

import com.ait.ess.workgroup.dto.PersonShiftDto;
import com.ait.ess.workgroup.mapper.PersonShiftMapper;
import com.ait.ess.workgroup.service.PersonShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonShiftServiceImpl implements PersonShiftService {

    @Autowired
    private PersonShiftMapper personShiftMapper;

    @Override
    public List<PersonShiftDto> getPersonShift(PersonShiftDto dto) {
        return personShiftMapper.selectPersonShift(dto);
    }
}
