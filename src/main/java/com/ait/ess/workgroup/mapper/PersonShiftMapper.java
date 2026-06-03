package com.ait.ess.workgroup.mapper;

import com.ait.ess.workgroup.dto.PersonShiftDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PersonShiftMapper {

    List<PersonShiftDto> selectPersonShift(PersonShiftDto dto);
}
