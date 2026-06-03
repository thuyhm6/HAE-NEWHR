package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArShift010 {
    private String shiftNo;
    private Integer datatype;
    private String shiftId;
    private String cpnyId;
    private String deptDistinguishNo;
    private Double deductTime;
    private String otTimeStart;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private String updatedIp;
    private String createdIp;
    private Double otAllowance;
    private String shiftShortname;
    private Double shiftLength;
}
