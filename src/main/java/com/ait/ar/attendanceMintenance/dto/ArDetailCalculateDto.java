package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArDetailCalculateDto {
    private String caltype;
    private String fromDate;
    private String toDate;
    private String deptId;
    private String sonDeptFlag;
    private String personId;
}
