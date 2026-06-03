package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrRecruitExecuteDto {

    private String adminID;
    private String adminIP;
    private String cpnyId;
    private String personIds;
    private String type;
    private String message;
}
