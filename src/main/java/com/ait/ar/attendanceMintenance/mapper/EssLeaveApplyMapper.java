package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyImportTempDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface EssLeaveApplyMapper {

    List<EssLeaveApplyDto> selectList(EssLeaveApplyDto dto);

    /**
     * Lấy giá trị tiếp theo của sequence ESS_APPLY_SEQ
     */
    Long getNextApplySeq();

    void insertLeaveApply(Map<String, Object> params);

    void updateLeaveApply(Map<String, Object> params);

    // Call Delete Confirm Procedure
    void callDeleteLeaveConfirm(Map<String, Object> params);

    void deleteArApplyResult(@Param("applyNo") String applyNo);

    EssLeaveApplyDto selectLeaveApplyInfo(@Param("applyNo") String applyNo);

    List<SyAffirmEmailDto> selectApprovalInfo(@Param("applyNo") String applyNo,
            @Param("applyType") String applyType);

    List<EssLeaveApplyImportTempDto> selectImportTempList(@Param("errorOnly") String errorOnly);

    void callImportAttendanceTemp(Map<String, Object> params);

    Map<String, Object> selectMyVacationInfo(@Param("adminID") String personId);

    Map<String, Object> selectLeaveLength(@Param("fromDateTime") String fromDateTime,
                                          @Param("toDateTime") String toDateTime,
                                          @Param("leaveTypeCode") String leaveTypeCode);

    List<EssLeaveApplyDto> selectMyLeaveApplyList(EssLeaveApplyDto dto);

    int cancelMyLeaveApplyList(@Param("applyNos") List<String> applyNos);

    Map<String, Object> selectEmpDefaultInfo(@Param("personId") String personId);

    Map<String, Object> selectLeaveLengthForPerson(@Param("personId") String personId,
                                                   @Param("fromTime") String fromTime,
                                                   @Param("toTime") String toTime,
                                                   @Param("leaveTypeCode") String leaveTypeCode);

    /**
     * Đếm số bản ghi xung đột thời gian trong ESS_LEAVE_APPLY_TB.
     * Bỏ qua record có AFFIRM_FLAG IN ('14014309','14014310') hoặc CONFIRM_FLAG = 0.
     */
    int countConflictLeaveApply(Map<String, Object> params);

    /**
     * Gọi hàm AR_GET_LEAVE_CLASH để kiểm tra xung đột chấm công / khóa ngày công.
     * Kết quả: >0 = trùng chấm công, -1 = ngày công đã chốt, -2 = thời gian đã khóa.
     */
    Integer selectLeaveClash(@Param("personId") String personId,
                             @Param("fromTime") String fromTime,
                             @Param("toTime") String toTime);

    void updateCancelLeaveApply(Map<String, Object> params);

    Map<String, Object> selectAffirmEmailForCancel(@Param("applyNo") String applyNo);

    void callAffirmCancel(Map<String, Object> params);

    void deleteLeaveApplyByApplyNo(@Param("applyNo") String applyNo);

    int countLockedByArDetailHtsv(@Param("applyNos") List<String> applyNos);

    int countLockedByArDeptManage(@Param("applyNos") List<String> applyNos);

}
