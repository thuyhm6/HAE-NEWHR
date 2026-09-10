package com.ait.ess.arConfirm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssOtConfirmDto {

    // Dữ liệu từ SQL (UNION ALL giữa ESS_APPLY_OT và ESS_APPLY_OT_OVER)
    private String applyNo;
    private String personId;
    private String applyTime;
    private String otTypeCode;
    private String otTypeCodeName;
    private String otApplyHour;
    private String applyOtDate;
    private String otFromDate;
    private String otToDate;
    private String otFromTime;
    private String otToTime;
    private String activity;
    private String confirmFlag;
    private String applyOtRemark;
    private String localName;
    private String empId;
    private String deptNo;
    private String empOffice;
    private String otOver;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String postFamily;
    private String postFamilyName;
    private String confirmBy;
    private String otTotail;

    // Tham số tìm kiếm
    private String searchEmpId;
    private List<String> searchDeptNos;
    private String searchOtTypeCode;
    private String searchOtOver;
    private String searchConfirmFlag;
    private String fromDate;
    private String toDate;

    // Phân trang DataTables
    private int draw;
    private int start;
    private int length;
}
