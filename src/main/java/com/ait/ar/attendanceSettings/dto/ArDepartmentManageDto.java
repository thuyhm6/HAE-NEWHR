package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArDepartmentManage;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArDepartmentManageDto extends ArDepartmentManage {
    private String dispDeptName; // Localized Dept name from HR_DEPARTMENT
    private Integer deptLevel;
}
