package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCardRecordDayDto {

    // Kết quả truy vấn
    private String localName;
    private String empId;
    private String deptName;
    private String deptTeam;
    private String postGradeNoName;
    private String empTypeCode;
    private String empTypeName;
    private String remax;
    private String shiftNo;
    private String shiftName;
    private String shiftTime;
    private String changeShiftPerson;
    private String eatTimes;
    private String leaveContent;
    private String arDateStr;
    private String ddateStr;
    private String inDay;
    private String inTime;
    private String outDay;
    private String outTime;

    // Tham số tìm kiếm
    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;
    private String shiftNoFilter;
    private String missingCard;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
