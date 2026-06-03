package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsParamObjectDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsParamObjectMapper {
    List<EvsParamObjectDto> selectList(EvsParamObjectDto dto);
    String getNextSeq();
    void insert(EvsParamObjectDto dto);
    void update(EvsParamObjectDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
