package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Model cho bảng EDU_TEACHER_MANAGER (Quản lý giảng viên).
 * Port từ /edu/traineducation/teacherManager (Hanwha_HTSV). Ngày dạng DD/MM/YYYY.
 */
@Data
public class EduTeacherManager {

    /** TEACHER_NO - khóa chính, sinh từ EDU_TEACHER_MANA_SEQ */
    private String teacherNo;

    /** EMPID - mã NV (nội bộ) hoặc mã sinh từ EDU_TEACHER_EMPID_SEQ (bên ngoài) */
    private String empid;
    private String personId;
    private String teacherName;

    private String orgNameLocal;
    private String postGradeNoName;
    private String positionNoName;

    /** Lĩnh vực (mã cha 14015148) */
    private String teachFieldCode;
    private String teachFieldCodeName;
    /** Cấp độ (mã cha 14015140) */
    private String teachLevelCode;
    private String teachLevelCodeName;
    /** Trạng thái (mã cha 14015155) */
    private String teachStatusCode;
    private String teachStatusCodeName;

    private String hireTime;
    private String firingTime;

    /** BUSINESS_ACT_TIME - kinh nghiệm (số tháng) nhập khi thêm mới */
    private String businessActTime;
    /** Tổng kinh nghiệm (tháng) = số tháng từ ngày làm việc + BUSINESS_ACT_TIME */
    private String allTime;

    private String remark;

    /** (Không lưu DB) true = giảng viên bên ngoài (nhập tay tên). */
    private Boolean external;
    /** (Không lưu DB) Kinh nghiệm nhập theo năm/tháng khi thêm mới. */
    private Integer businessYear;
    private Integer businessMonth;
}
