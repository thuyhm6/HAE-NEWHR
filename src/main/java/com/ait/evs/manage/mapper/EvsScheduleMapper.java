package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsScheduleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsScheduleMapper {
    List<EvsScheduleDto> selectList(EvsScheduleDto dto);
    String getNextSeq();
    void insert(EvsScheduleDto dto);
    void update(EvsScheduleDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
