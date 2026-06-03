package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArDetailCalculateDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArDetailCalculateMapper {
    void callDetailCalculateProcedure(ArDetailCalculateDto params);
}
