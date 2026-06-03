package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmorSetupDto;

import java.util.List;

public interface EvsAffirmorSetupService {

    /** Lấy danh sách đối tượng đánh giá kèm người đánh giá */
    List<EvsAffirmorSetupDto> getList(EvsAffirmorSetupDto params);

    /** Tìm kiếm nhân viên để chọn làm người đánh giá */
    List<EvsAffirmorSetupDto> searchEmployee(EvsAffirmorSetupDto params);

    /** Lưu hàng loạt (batch) người đánh giá */
    void saveBatch(List<EvsAffirmorSetupDto> list);

    /** Thêm mới đối tượng đánh giá và người đánh giá (gọi stored procedure) */
    void addObject(EvsAffirmorSetupDto dto);

    /** Tạo mục tiêu đánh giá (gọi PKG_EVS_PROCESS.PR_CREATE_EVS_TARGET) */
    void createTarget(EvsAffirmorSetupDto dto);

    /** Bắt đầu đánh giá (gọi PKG_EVS_PROCESS.PR_EVS_START) */
    void evsStart(EvsAffirmorSetupDto dto);

    /** Xóa các đối tượng đánh giá theo danh sách SEQ */
    void deleteObjects(List<String> seqList);
}
