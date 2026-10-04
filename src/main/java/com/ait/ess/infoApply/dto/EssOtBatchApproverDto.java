package com.ait.ess.infoApply.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tăng ca hàng loạt chọn người duyệt tùy ý:
 * /ess/infoApply/viewApplyOtLBatchByAnyApproverList (ESS_APPLY_OT) và
 * /ess/infoApply/viewApplyOTBatchInfoHAE (ESS_APPLY_OT_OVER - tăng ca vượt).
 * Dùng chung cho dòng danh sách, điều kiện tìm kiếm và kết quả tính toán.
 */
@Data
@NoArgsConstructor
public class EssOtBatchApproverDto {

    // ── Dòng danh sách ──
    private String applyNo;
    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String postFamily;
    private String shiftName;
    private String shiftTime;
    /** DD/MM/YYYY */
    private String applyOtDate;
    /** DD/MM/YYYY */
    private String otFromDate;
    /** DD/MM/YYYY */
    private String otToDate;
    /** HH24:MI */
    private String otFromTime;
    /** HH24:MI */
    private String otToTime;
    private String applyOtRemark;
    private String carAddress;
    private String carAddressName;
    private String carAddressDetail;
    private String carAddressDetailName;
    private String otTypeCode;
    private String otTypeCodeName;
    private String otApplyHour;
    private String affirmFlag;
    private String affirmFlagName;
    private String confirmFlag;
    private String offsetYn;
    private String deductYn;
    private String usecarYn;
    private String createdBy;
    private String indoorTime;
    private String outdoorTime;

    // ── Tăng ca lũy kế / giới hạn (getOt_Totail) ──
    private String otTotail;
    private String otTotailMonth;
    private String weekdayOtTotail;
    private String saturdayOtTotail;
    private String weekendOtTotail;
    private String hoildayOtTotail;
    private String otLimitMonth;
    private String otLimitYear;
    /** YYYY/MM/DD HH24:MI - giờ kết thúc ca của ngày tăng ca */
    private String arShiftEndTime;

    // ── Kết quả getValidateInfo / getDefaultOtTimeSST ──
    private String otLength;
    private String otShiftLength;
    private String dateType;
    /** HH24:MI */
    private String shiftStartTime;
    /** HH24:MI */
    private String shiftEndTime;
    /** HH24:MI */
    private String shiftEndTime2;

    // ── Điều kiện tìm kiếm ──
    /** true = tăng ca vượt (ESS_APPLY_OT_OVER) */
    private boolean over;
    private String keyword;
    private String deptNo;
    private String shiftNo;
    private String searchOtTypeCode;
    private String searchAffirmFlag;
    /** YYYY-MM-DD */
    private String startDate;
    /** YYYY-MM-DD */
    private String endDate;
}
