package com.ait.ess.infoApplyAttendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssCoordApplyAttendanceDto {

    // Dữ liệu từ SQL
    private String empId;
    private String localName;
    private String itemNo;
    private String deptName;
    private String shiftName;
    private String postGradeNo;
    private String postGradeName;
    private String itemName;
    private String arDateStr;
    private String fromDate;
    private String toTime;
    private String quantity;
    private String unit;
    private String remark;
    private String statusName;
    private String lockYn;

    // Tham số tìm kiếm
    private String keyword;
    private String startDate;
    private String endDate;
    private String deptNos;
    private String shiftNo;
    private String itemNoSearch;
    private String statusCode;
    private String postFamily;

    // Phân trang DataTables
    private int draw;
    private int start;
    private int length;
}
