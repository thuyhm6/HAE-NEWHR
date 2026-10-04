package com.ait.ess.infoApply.service;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ess.infoApply.dto.EssOtBatchApproverDto;

import java.util.List;

/**
 * Tăng ca hàng loạt chọn người duyệt tùy ý - port từ InfoApplyCtroller (Hanwha_HAE):
 * viewApplyOtLBatchByAnyApproverList (tăng ca thường) và viewApplyOTBatchInfoHAE (tăng ca vượt).
 */
public interface EssOtBatchApproverService {

    List<EssOtBatchApproverDto> getList(EssOtBatchApproverDto params);

    /** getValidateInfo - applyOtDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
    EssOtBatchApproverDto getValidateInfo(String personId, String applyOtDate, String otFromTime,
                                          String otToTime, String deductYn);

    /** Thông tin nhân viên + tăng ca lũy kế/giới hạn tại ngày tăng ca (YYYY-MM-DD) */
    EssOtBatchApproverDto getRowInfo(String personId, String applyOtDate);

    /** getDefaultOtTimeSST - loại ngày + giờ ca của người đăng nhập (YYYY-MM-DD) */
    EssOtBatchApproverDto getDayDefault(String applyOtDate);

    /**
     * Lưu các dòng đã chọn (thêm mới hoặc sửa) kèm dây chuyền duyệt từng dòng.
     * @return danh sách APPLY_NO đã lưu (để gửi EagleOffice)
     */
    List<String> save(List<ArOvertimeManagentDto> items, boolean over);

    /** Xóa (ACTIVITY = 0) + hủy tiến trình phê duyệt */
    int delete(List<String> applyNos, boolean over);
}
