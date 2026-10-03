package com.ait.sy.sys.service;

import com.ait.sy.sys.dto.PersonalDataConfirmInfoDTO;

/**
 * PersonalDataConfirmService - Xử lý popup bắt buộc xác nhận đồng ý xử lý dữ
 * liệu cá nhân sau khi đăng nhập (sy_user.PERSONAL_DATA_CONFIRM_BY)
 */
public interface PersonalDataConfirmService {

    /**
     * Lấy thông tin nhân viên hiển thị trên popup xác nhận (Họ tên, ID, Chức
     * vụ, Team/Part/Cell) - lấy từ HR_EMPLOYEE
     *
     * @param personId ID cá nhân
     * @return PersonalDataConfirmInfoDTO hoặc null nếu không tìm thấy
     */
    PersonalDataConfirmInfoDTO getConfirmInfo(String personId);

    /**
     * Ghi nhận người dùng đã đồng ý xử lý dữ liệu cá nhân - cập nhật
     * PERSONAL_DATA_CONFIRM_BY, PERSONAL_DATA_CONFIRM_DATE,
     * PERSONAL_DATA_CONFIRM_IP trong sy_user
     *
     * @param userNo Mã người dùng
     * @return true nếu cập nhật thành công
     */
    boolean confirmPersonalData(String userNo);
}
