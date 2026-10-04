package com.ait.ess.infoApply.dto;

import lombok.Data;

/**
 * Thông tin phụ trợ cho các form xin phép SST (port từ Hanwha_HAE):
 * - /ess/infoApply/viewSSTOtApplyInfo, /ess/infoApply/viewSSTOtApplyInfoTx
 *   (getOtShiftTime, getOtLength)
 */
@Data
public class EssSstApplyDto {

    // ===== getOtShiftTime =====
    /** GET_AR_DATETYPE: 1440 ngày thường, 1441 ngày nghỉ, 90000425 ..., khác = ngày lễ */
    private String dateType;
    private String shiftName;
    /** HH24:MI */
    private String shiftStartTime;
    /** HH24:MI */
    private String shiftEndTime;
    /** HH24:MI - giờ kết thúc ca + 2 tiếng */
    private String shiftEndTime2;
    /** YYYY/MM/DD HH24:MI */
    private String arShiftStartTime;
    /** YYYY/MM/DD HH24:MI */
    private String arShiftEndTime;
    private String indoorTime;
    private String outdoorTime;
    private String otTotailMonth;
    private String otTotail;

    // ===== getOtLength =====
    private String otLength;
    private String otLimitMonth;
    private String otLimitYear;
}
