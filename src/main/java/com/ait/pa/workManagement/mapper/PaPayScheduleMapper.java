package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaPayScheduleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaPayScheduleMapper {

    List<PaPayScheduleDto> selectList(PaPayScheduleDto params);

    List<PaPayScheduleDto> selectOpenList();

    PaPayScheduleDto selectOne(@Param("payScheduleNo") String payScheduleNo);

    String getNextSeq();

    void insert(PaPayScheduleDto dto);

    void update(PaPayScheduleDto dto);

    void delete(@Param("payScheduleNo") String payScheduleNo);
}
