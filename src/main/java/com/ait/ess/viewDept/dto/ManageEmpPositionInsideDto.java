package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManageEmpPositionInsideDto {
    private String personId;
    private String startDate;
    private String deptName;
    private String mainBusiness;
    private String postGrade;
    private String transCode;
}
