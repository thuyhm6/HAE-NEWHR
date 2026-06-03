package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaWorkFlowDto;
import com.ait.pa.workManagement.dto.PaWorkFlowRecordsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaWorkFlowMapper {

    PaWorkFlowDto selectOne(@Param("payScheduleNo") String payScheduleNo);

    List<PaWorkFlowRecordsDto> selectRecordList(@Param("payScheduleNo") String payScheduleNo,
                                                @Param("flowStep") Integer flowStep);

    void insert(PaWorkFlowDto dto);

    void callModifyWorkFlow(PaWorkFlowDto dto);
}
