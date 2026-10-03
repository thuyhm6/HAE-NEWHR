package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Điều kiện tìm chung cho các màn đăng ký / phê duyệt / xác nhận khóa đào tạo.
 */
@Data
public class EduApplyQuery {

    /** Phòng ban của người đăng ký (gồm phòng ban con) */
    private String deptNo;
    /** Mã NV (khớp đúng) hoặc họ tên */
    private String keyword;
    private String courseName;
    /** DD/MM/YYYY */
    private String startDate;
    /** DD/MM/YYYY */
    private String endDate;
    /** Trạng thái phê duyệt (courseMaker, makerSituation) hoặc xác nhận (courseConfirm) */
    private String flag;

    // ===== Nội bộ - service tự gán =====
    private String makerPersonId;
    private String stuPersonId;
    /** makerSituation: chỉ đơn của học viên thuộc danh sách dự kiến của khóa */
    private boolean plannedOnly;
}
