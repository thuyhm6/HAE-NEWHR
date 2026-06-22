package com.ait.hrm.approve.service;

import com.ait.hrm.approve.dto.HrmApproveApplyDto;

import java.util.List;
import java.util.Map;


public interface HrmApproveService {

    int countApplyList(HrmApproveApplyDto dto);

    List<HrmApproveApplyDto> getApplyListPage(HrmApproveApplyDto dto);

    /**
     * Lấy chi tiết bản ghi apply theo applyNo và applyTableType.
     * Trả về DTO tương ứng với loại apply (HrPersonalInfoApplyDto, HrFamilyApplyDto, ...).
     */
    Object getApplyDetail(String applyNo, String applyTableType);

    /**
     * Lấy dữ liệu gốc (trước khi thay đổi) từ bảng chính để so sánh.
     * Trả về null nếu là bản ghi mới (APPLY_TYPE=1).
     */
    Map<String, Object> getOriginalData(String applyNo, String applyTableType);

    /**
     * Phê duyệt: cập nhật ACTIVITY=2 trong bảng apply VÀ copy dữ liệu vào bảng chính.
     */
    void approve(String applyNo, String applyTableType);

    /**
     * Từ chối: chỉ cập nhật ACTIVITY=3 trong bảng apply.
     */
    void reject(String applyNo, String applyTableType);
}
