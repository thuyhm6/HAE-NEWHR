package com.ait.ess.infoApplyAttendance.service;

import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchDto;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;

import java.util.List;
import java.util.Map;

/**
 * Xin nghỉ phép hàng loạt (chọn người duyệt tùy ý) -
 * /ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.
 */
public interface EssApplyAttBatchService {

    List<EssApplyAttBatchDto> getList(EssApplyAttBatchDto params);

    /** Dây chuyền duyệt đã lưu, nhóm theo APPLY_NO */
    Map<String, List<SyAffirmEmailDto>> getAffirmorsByApplyNos(List<String> applyNos);

    /** Dây chuyền duyệt mặc định theo nhân viên + loại nghỉ + thời lượng (GET_AFFIRMOR_LIST_IMPROVE) */
    List<SyAffirmEmailDto> getDefaultAffirmors(String personId, String leaveTypeCode, String applyLength);

    EssApplyAttBatchDto getEmpAttendanceInfo(String personId, String applyDate);

    EssApplyAttBatchDto calcLeaveLength(String personId, String fromTime, String toTime, String leaveTypeCode);

    /** Kiểm tra giới tính theo loại nghỉ (getLeaveDateSST). Trả về message key nếu không hợp lệ, null nếu hợp lệ */
    String checkLeaveSex(String personId, String leaveTypeCode);

    /**
     * Lưu (thêm mới/cập nhật) nhiều đơn trong 1 transaction.
     * Kết quả: applyNos (List) - các đơn đã lưu, misDocIds (List) - đơn cũ cần hủy trên EagleOffice.
     */
    Map<String, Object> saveBatch(List<EssApplyAttBatchSaveDto> items);

    /**
     * Xóa (ACTIVITY = 0) nhiều đơn trong 1 transaction.
     * Kết quả: misDocIds (List) - đơn cần hủy trên EagleOffice.
     */
    Map<String, Object> deleteBatch(List<String> applyNos);

    /** Lỗi nghiệp vụ mang message key để frontend dịch đa ngôn ngữ */
    class BusinessException extends RuntimeException {
        private final String messageKey;
        private final String suffix;

        public BusinessException(String messageKey, String suffix) {
            super(messageKey + (suffix == null ? "" : " " + suffix));
            this.messageKey = messageKey;
            this.suffix = suffix;
        }

        public String getMessageKey() {
            return messageKey;
        }

        /** Phần text đi kèm sau message (vd: tên nhân viên) */
        public String getSuffix() {
            return suffix;
        }
    }
}
