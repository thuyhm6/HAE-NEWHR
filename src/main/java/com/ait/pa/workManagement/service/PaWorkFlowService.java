package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaWorkFlowDto;
import com.ait.pa.workManagement.dto.PaWorkFlowRecordsDto;

import java.util.List;

public interface PaWorkFlowService {

    PaWorkFlowDto getWorkFlow(String payScheduleNo);

    List<PaWorkFlowRecordsDto> getRecordList(String payScheduleNo, Integer flowStep);

    String modifyWorkFlow(String payScheduleNo, String type);
}
