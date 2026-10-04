package com.ait.ess.infoApplyAttendance.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dòng dữ liệu + tham số tìm kiếm cho màn hình xin nghỉ phép hàng loạt
 * (chọn người duyệt tùy ý) - /ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.
 * Port từ ess.infoApplyLeave.getNullBatchLeaveAffirmInfoList (dự án Hanwha_HAE).
 */
@Data
@NoArgsConstructor
public class EssApplyAttBatchDto {

    // ===== Dữ liệu trả về =====
    private String applyNo;
    private String applyTime;
    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String shiftNoName;
    private String dutyNo;
    /** Ngày/giờ bắt đầu - định dạng DD/MM/YYYY và HH24:MI */
    private String fromDate;
    private String fromTime;
    /** Ngày/giờ kết thúc - định dạng DD/MM/YYYY và HH24:MI */
    private String toDate;
    private String toTime;
    private String dayHours;
    private String leaveReason;
    private String leaveTypeCode;
    private String leaveTypeCodeName;
    private String applyLength;
    private String affirmFlag;
    private String affirmFlagName;
    private String confirmFlag;
    private String createdBy;
    /** Tổng phép năm (ngày) */
    private String totVacCnt;
    /** Phép năm còn lại (ngày) */
    private String shengyuVacCnt;
    private String sexCode;

    // ===== Tham số tìm kiếm =====
    private String keyword;
    private String deptNo;
    private String shiftNo;
    private String searchLeaveTypeCode;
    private String searchAffirmFlag;
    private String searchConfirmFlag;
    /** Kỳ tìm kiếm - định dạng YYYY-MM-DD */
    private String startDate;
    private String endDate;

    // ===== Tham số tra cứu thông tin nhân viên theo ngày =====
    /** Ngày áp dụng - định dạng YYYY-MM-DD */
    private String applyDate;
}
