package com.ait.ess.workgroup.service;

import com.ait.ess.workgroup.dto.PersonShiftDto;

import java.util.List;

public interface PersonShiftService {

    List<PersonShiftDto> getPersonShift(PersonShiftDto dto);
}
