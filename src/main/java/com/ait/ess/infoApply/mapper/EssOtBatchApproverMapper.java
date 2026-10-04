package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssOtBatchApproverDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho màn hình tăng ca hàng loạt (chọn người duyệt tùy ý) - thường và vượt.
 * Ghi/hủy đơn + dây chuyền duyệt tái sử dụng ArOvertimeManagentMapper/Service,
 * ở đây chỉ chứa các câu lệnh riêng của màn hình.
 */
@Mapper
public interface EssOtBatchApproverMapper {

    /** getNullBatchOTTSTOAffirmInfoList (over=false) / getAddOTApplyInfoForBatchHAE (over=true) */
    List<EssOtBatchApproverDto> selectList(EssOtBatchApproverDto params);

    /**
     * getValidateInfo: loại tăng ca, thời lượng, loại ngày, giờ ca, giờ quẹt thẻ.
     * applyOtDate: YYYY-MM-DD; otFromTime/otToTime: YYYY-MM-DD HH24:MI
     */
    EssOtBatchApproverDto selectValidateInfo(@Param("personId") String personId,
                                             @Param("applyOtDate") String applyOtDate,
                                             @Param("otFromTime") String otFromTime,
                                             @Param("otToTime") String otToTime,
                                             @Param("deductYn") String deductYn);

    /** Thông tin nhân viên tại ngày tăng ca + tăng ca lũy kế/giới hạn (getPersonCntByEmpid + getOt_Totail) */
    EssOtBatchApproverDto selectRowInfo(@Param("personId") String personId,
                                        @Param("applyOtDate") String applyOtDate);

    /** getDefaultOtTimeSST: loại ngày + giờ ca của người đăng nhập tại ngày chọn (YYYY-MM-DD) */
    EssOtBatchApproverDto selectDayDefault(@Param("applyOtDate") String applyOtDate);

    /** delOtApplyAffirmForBatch / delOtOverApplyAffirmForBatch: ACTIVITY = 0 */
    int deactivateApply(@Param("applyNo") String applyNo, @Param("over") boolean over);
}
