package com.ait.pa.workManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaWorkFlowDto {

    private String paWorkFlowNo;
    private String payScheduleNo;
    private String hrStartDate;
    private String hrEndDate;
    private String arStartDate;
    private String arEndDate;
    private Integer objCreateFlag;
    private Integer arMonthCalFlag;
    private Integer paCalFlag;
    private Integer paConfirmFlag;
    private Integer paOpenFlag;
    private Integer arLockFlag;
    private Integer empCount;

    // Tham số gọi stored procedure
    private String type;
    private String message;
}
