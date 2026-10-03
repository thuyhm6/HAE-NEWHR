package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaArSummaryItemDto;
import com.ait.pa.workManagement.dto.PaArSummaryManageDto;
import com.ait.pa.workManagement.dto.PaArSummarySaveReqDto;
import com.ait.pa.workManagement.dto.PaArSummaryScheduleDto;

import java.util.List;

public interface PaArSummaryManageService {

    List<PaArSummaryScheduleDto> getScheduleList();

    List<PaArSummaryItemDto> getItemList();

    List<PaArSummaryManageDto> getList(PaArSummaryManageDto params);

    int save(PaArSummarySaveReqDto req);

    byte[] exportExcel(PaArSummaryManageDto params);
}
