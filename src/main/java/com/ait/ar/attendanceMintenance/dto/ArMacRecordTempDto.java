package com.ait.ar.attendanceMintenance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArMacRecordTempDto {
    private Long lineId;
    private String cardNo;
    @JsonProperty("rTime")
    private String rTime;
    private String doorType;
    private String insertBy;
    private String empId;
    private String remark;
    private String cpnyId;
    private Integer activity;
    private Integer orderno;
    private String uploadDate;
    private String uploadBy;
    private String uploadErrorMsg;
    private String resultFlag;
    private String localName;
    private String dept;
    @JsonProperty("rDate")
    private String rDate;
    private String arDateStr;

    // Tham số tìm kiếm
    private String errorOnly;
}
