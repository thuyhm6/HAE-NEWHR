package com.ait.ar.attendanceMintenance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArMacRecordEatDto {

    private String seq;
    private String empId;
    private String eatDate;
    private String eatName;
    private String localName;
    @JsonProperty("rDate")
    private String rDate;
    @JsonProperty("rTime")
    private String rTime;
    private Integer amount;
    private String attendanceDate;
    private String outdoorTime;
    private String deptName;
    private String remark;
    private String postGradeName;
    private String insertBy;

    // Fields dùng khi import từ thiết bị (insertFromDevice)
    private String employeeName;  // EMPLOYEE_NAME (FirstName từ device)
    private String cardTime;      // CARD_TIME format YYYY/MM/DD HH:mm
    private String doorName;      // DOOR_NAME
    private String departName;    // DEPART_NAME

    // Tham số tìm kiếm
    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
