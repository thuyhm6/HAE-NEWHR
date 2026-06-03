package com.ait.ar.attendanceSettings.dto;

import com.ait.hrm.empinfo.dto.EmployeeNameDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ArVacEmpDto extends EmployeeNameDto {
    private String cpnyId;
    private String vacTp;
    private String vacId;
    private String strtDate;
    private String endDate;
    private String totVacCnt;
    private String lastYearVac;
    private String addVac;
    private String useVacCnt;
    private String remark;
    private String createDate;
    private String createdBy;
    private String createdIp;
    private String updateDate;
    private String updatedBy;
    private String updatedIp;
    private String activity;
    private String mentVac;
    private String workMonth;
    private String isLocked;
    private String reasonWujia;
    private String lastYearCal;
    private String yearVacCal;
    private String lastYearCal2;
    private String useVac1;
    private String useVac2;
    private String useVac3;
    private String useVac4;
    private String useVac5;
    private String useVac6;
    private String useVac7;
    private String useVac8;
    private String useVac9;
    private String useVac10;
    private String useVac11;
    private String useVac12;
    private String useVac;
    private String affirmUseVac;

    private String keyword;
    private String deptNos;
    private String empOffice;
}
