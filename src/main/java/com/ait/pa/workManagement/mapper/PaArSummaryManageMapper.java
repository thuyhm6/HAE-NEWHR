package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaArSummaryItemDto;
import com.ait.pa.workManagement.dto.PaArSummaryManageDto;
import com.ait.pa.workManagement.dto.PaArSummaryScheduleDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PaArSummaryManageMapper {

    List<PaArSummaryScheduleDto> selectScheduleList();

    List<PaArSummaryItemDto> selectItemList();

    List<PaArSummaryManageDto> selectList(PaArSummaryManageDto params);

    List<PaArSummaryManageDto> selectExcelList(PaArSummaryManageDto params);

    int update(PaArSummaryManageDto dto);
}
