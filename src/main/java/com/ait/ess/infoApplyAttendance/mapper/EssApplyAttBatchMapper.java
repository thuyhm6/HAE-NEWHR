package com.ait.ess.infoApplyAttendance.mapper;

import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * Mapper cho màn hình xin nghỉ phép hàng loạt (chọn người duyệt tùy ý).
 * Các câu lệnh dùng chung (insert/update đơn, gọi procedure hủy duyệt...) được
 * tái sử dụng từ EssLeaveApplyMapper, ở đây chỉ chứa các câu lệnh riêng.
 */
@Mapper
public interface EssApplyAttBatchMapper {

    List<EssApplyAttBatchDto> selectList(EssApplyAttBatchDto params);

    /** Dây chuyền duyệt đã lưu của nhiều đơn (bỏ AFFIRM_TYPE = 4 - người tạo) */
    List<SyAffirmEmailDto> selectAffirmorByApplyNos(@Param("applyNos") List<String> applyNos);

    /** Phòng ban, ca, phép năm (tổng/còn lại), số giờ/ngày của nhân viên tại 1 ngày */
    EssApplyAttBatchDto selectEmpAttendanceInfo(@Param("personId") String personId,
                                                @Param("applyDate") String applyDate);

    /** Thời lượng nghỉ (GET_AR_LEAVE_LENGTH) + số giờ/ngày (AR_GET_DAY_HOURS) */
    EssApplyAttBatchDto selectLeaveLength(@Param("personId") String personId,
                                          @Param("fromTime") String fromTime,
                                          @Param("toTime") String toTime,
                                          @Param("leaveTypeCode") String leaveTypeCode);

    String selectSexCode(@Param("personId") String personId);

    /** MIN_VALUE + UNIT của loại nghỉ trong AR_ITEM_PARAM */
    Map<String, Object> selectLeaveItemMinValue(@Param("leaveTypeCode") String leaveTypeCode);

    /** Thông tin đơn cần xóa: PERSON_ID, giờ bắt đầu/kết thúc (YYYY-MM-DD HH24:MI) */
    EssApplyAttBatchDto selectApplyForDelete(@Param("applyNo") String applyNo);

    /** MISDOCID của đơn đã gửi EagleOffice (SEND_EMAIL_FLAG = 1) */
    String selectSentMisDocId(@Param("applyNo") String applyNo);

    int insertArShiftChange(@Param("applyNo") String applyNo);

    int deactivateLeaveApply(@Param("applyNo") String applyNo);
}
