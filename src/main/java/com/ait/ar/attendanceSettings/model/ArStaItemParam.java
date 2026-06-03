package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArStaItemParam {
    private String paramNo; // VARCHAR2(30)
    private String itemNo; // VARCHAR2(30)
    private String cpnyId; // VARCHAR2(20)
    private String unit; // VARCHAR2(30)
    private Double minUnit; // NUMBER
    private Integer calOrder; // NUMBER
    private Integer activity; // NUMBER(1)
    private Integer orderno; // NUMBER
    private Integer manageFlag; // NUMBER

    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String createdIp;
    private String updatedIp;
}
