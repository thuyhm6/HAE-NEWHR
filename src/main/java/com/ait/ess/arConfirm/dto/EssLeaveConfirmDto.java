package com.ait.ess.arConfirm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssLeaveConfirmDto {

    // Dữ liệu từ SQL
    private String applyNo;
    private String applyTime;
    private String personId;
    private String dayHours;
    private String leaveFromTime;
    private String leaveToTime;
    private String overDay;
    private String overHour;
    private String leaveReason;
    private String leaveTypeCode;
    private String leaveTypeCodeName;
    private String hrComment;
    private String applyLength;
    private String confirmFlag;
    private String activity;
    private String createdBy;
    private String createdName;
    private String localName;
    private String deptNo;
    private String empId;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String postFamily;
    private String postFamilyName;
    private String confirmBy;

    // Tham số tìm kiếm
    private String searchEmpId;
    private String searchLocalName;
    private String fromDate;
    private String toDate;
    private String searchLeaveTypeCode;
    private String searchConfirmFlag;

    // Phân trang DataTables
    private int draw;
    private int start;
    private int length;
}
