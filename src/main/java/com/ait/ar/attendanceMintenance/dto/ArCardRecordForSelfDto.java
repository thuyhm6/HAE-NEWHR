package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCardRecordForSelfDto {

    private Long recordNo;
    private String cardNo;
    private String personId;
    private String doorType;
    private String insertBy;
    private String dataSourceName;
    private String remark;
    private String arDateStr;
    private String swipeDate;
    private String swipeTime;
    private String employeeName;
    private String deviceName;
    private String swipeDatetime;

    // Từ HR_EMPLOYEE (LEFT JOIN: CARD_NO = EMPID)
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;

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
