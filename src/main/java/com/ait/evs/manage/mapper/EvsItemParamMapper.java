package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsItemParamDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsItemParamMapper {

    List<EvsItemParamDto> selectList(EvsItemParamDto dto);

    String getNextSeq();

    void insert(EvsItemParamDto dto);

    void update(EvsItemParamDto dto);

    void deleteBySeq(String seq);
}
