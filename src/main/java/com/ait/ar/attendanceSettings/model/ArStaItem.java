package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArStaItem {
    private String itemNo; // VARCHAR2(30)
    private String unit; // VARCHAR2(10)
    private String datatype; // VARCHAR2(20)
    private String staItemId; // VARCHAR2(50)
    private Integer activity; // NUMBER
    private Integer orderno; // NUMBER
    private String showYn; // VARCHAR2(20)
    private Integer showOrder; // NUMBER

    // Audit fields can refer to the image (CREATE_DATE, CREATED_BY, UPDATE_DATE,
    // UPDATED_BY)
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String createdIp;
    private String updatedIp;
}
