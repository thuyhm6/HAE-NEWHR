package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsResultEmpDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsResultEmpMapper {

    List<EvsResultEmpDto> selectList(EvsResultEmpDto params);
}
