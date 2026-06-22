package com.ait.hrm.approve.mapper;

import com.ait.hrm.approve.dto.HrmApproveApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface HrmApproveMapper {

    int countApplyList(HrmApproveApplyDto dto);

    List<HrmApproveApplyDto> selectApplyListPage(HrmApproveApplyDto dto);

    // --- Cập nhật ACTIVITY trong bảng apply ---
    int updatePersonalApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateAddressApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateFamilyApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateEmergencyApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateWorkExpApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateEducationApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);
    int updateQualificationApplyActivity(@Param("applyNo") String applyNo, @Param("activity") int activity);

    // --- Sao chép dữ liệu từ bảng apply vào bảng chính khi duyệt ---
    int approvePersonalInfo(@Param("applyNo") String applyNo);
    int approveAddress(@Param("applyNo") String applyNo);
    int approveFamily(@Param("applyNo") String applyNo);
    int approveEmergency(@Param("applyNo") String applyNo);
    int approveWorkExp(@Param("applyNo") String applyNo);
    int approveEducation(@Param("applyNo") String applyNo);
    int approveQualification(@Param("applyNo") String applyNo);

    // --- Lấy dữ liệu ban đầu từ bảng chính để so sánh (dùng applyNo để tự JOIN) ---
    Map<String, Object> getOriginalPersonal(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalAddress(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalFamily(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalEmergency(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalWorkExp(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalEducation(@Param("applyNo") String applyNo);
    Map<String, Object> getOriginalQualification(@Param("applyNo") String applyNo);

    // --- Đếm tổng số yêu cầu thay đổi thông tin đang chờ duyệt (ACTIVITY=1) ---
    int countPendingPersonalChanges();
}
