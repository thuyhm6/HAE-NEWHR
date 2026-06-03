package com.ait.pa.workManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaWorkFlowRecordsDto {

    private Long   recordNo;
    private Long   paWorkFlowNo;
    private Integer flowStep;
    private String createDate;
    private String createdBy;
    private String createdIp;
    private Integer rowNum;
}
