package com.ait.ess.infoApply.service;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ess.infoApply.dto.EssSstApplyDto;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveDto;

/**
 * Form xin phép SST cho chính nhân viên đăng nhập (port từ Hanwha_HAE):
 * /ess/infoApplyAttendance/viewSSTApplyAttendance, /ess/infoApply/viewSSTOtApplyInfo,
 * /ess/infoApply/viewSSTOtApplyInfoTx.
 */
public interface EssSstApplyService {

    /** getOtShiftTime - applyDate: YYYY-MM-DD */
    EssSstApplyDto getOtShiftTime(String applyDate);

    /** getOtLength - applyDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
    EssSstApplyDto getOtLength(String applyDate, String otTypeCode, String otFromTime, String otToTime, String deductYn);

    /** AR_GET_OT_CLASH (over = false) / AR_GET_OT_OVER_CLASH (over = true) */
    Integer checkOtClash(String otFromTime, String otToTime, String offsetYn, boolean over);

    /**
     * addSSTOvertimeApply / addOtOverApply: kiểm tra CHECK_OT_TIME rồi lưu đơn + dây chuyền duyệt
     * (tái sử dụng ArOvertimeManagentService#save / #saveOver). Trả về APPLY_NO vừa lưu.
     */
    String saveOvertime(ArOvertimeManagentDto dto, boolean over);

    /**
     * addLeaveApplySST: kiểm tra CHECK_LEAVE_TIME rồi lưu đơn + dây chuyền duyệt
     * (tái sử dụng EssApplyAttBatchService#saveBatch). Trả về APPLY_NO vừa lưu.
     */
    String saveLeave(EssApplyAttBatchSaveDto item);

    /** Lỗi nghiệp vụ trả về từ hàm kiểm tra PL/SQL (nội dung đã được DB dịch sẵn) */
    class CheckException extends RuntimeException {
        public CheckException(String message) {
            super(message);
        }
    }
}
