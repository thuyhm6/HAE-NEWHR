package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * Model cho bảng EDU_COURSE_MANAGER (Quản lý khóa học).
 * Port từ /edu/traineducation/courseManager (Hanwha_HTSV).
 */
@Data
public class EduCourseManager {

    /** COURSE_NO - khóa chính, sinh từ EDU_COUR_MANA_SEQ */
    private String courseNo;

    /** SYSMANA_NO - Loại hình (EDU_SYSTEM_MANAGER) được chọn khi thêm mới */
    private String sysmanaNo;

    private String trainTypeCode;
    private String trainTypeCodeName;
    private String trainTypeNo;

    /** COURSE_NAME_CODE - Tên khóa học (nhập tay) */
    @NotBlank(message = "COURSE_NAME_CODE không được để trống")
    private String courseNameCode;

    /** COURSE_NUMBER - Mã khóa học tự sinh: TRAIN_TYPE_NO + "-" + 4 chữ số */
    private String courseNumber;

    private String remark;
}
