package com.ait.ess.arConfirm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssAttendanceExConfirmDto {

    // Dữ liệu từ SQL
    private String seq;
    private String applyNo;
    private String personId;
    private String applyReason;
    private String affirmFlag;
    private String applyTime;
    private String affirmFlagName;
    private String shiftName;
    private String itemNo;
    private String itemName;
    private String arDateStr;
    private String inTime;
    private String outTime;
    private String fromTime;
    private String toTime;
    private String confirmFlag;
    private String hrComment;
    private String localName;
    private String empId;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String postFamily;
    private String postFamilyName;
    private String activity;
    private String confirmBy;
    private String indoorTime;
    private String outdoorTime;

    // Tham số tìm kiếm
    private String searchEmpId;
    private String fromDate;
    private String toDate;
    private String searchConfirmFlag;

    // Phân trang DataTables
    private int draw;
    private int start;
    private int length;
}
