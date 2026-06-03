package com.ait.ar.attendanceSettings.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArEmpGroupDto {
    private String personId;
    private String groupNo;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;

    // Join with HR_EMPLOYEE
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
}
