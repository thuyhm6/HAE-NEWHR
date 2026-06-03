package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsParamDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsParamMapper {
    List<EvsParamDto> selectList(EvsParamDto dto);
    List<EvsParamDto> selectGroupOptions(EvsParamDto dto);
    String getNextSeq();
    void insert(EvsParamDto dto);
    void update(EvsParamDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
