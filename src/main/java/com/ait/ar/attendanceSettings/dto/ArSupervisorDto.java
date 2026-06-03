package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArSupervisor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArSupervisorDto extends ArSupervisor {
    private String empId; // HR_EMPLOYEE.EMPID
    private String empName; // HR_EMPLOYEE.EMP_NAME / FULL_NAME
    private String deptName; // HR_DEPARTMENT.DEPT_NAME
}
