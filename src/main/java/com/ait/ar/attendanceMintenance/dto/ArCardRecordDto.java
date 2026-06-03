package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCardRecordDto {

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
    private String activity;

    // Từ HR_EMPLOYEE
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;

    // Từ AR_SCHEDULE_HTSV
    private String shiftNo;
    private String shiftName;

    // Tham số tìm kiếm
    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;

    // Dùng cho form thêm/sửa (YYYY/MM/DD HH24:MI)
    private String swipeDatetime;

    // Dùng cho xóa nhiều bản ghi (comma-separated recordNos)
    private String recordNos;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
