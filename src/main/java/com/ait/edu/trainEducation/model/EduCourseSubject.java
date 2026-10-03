package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * Model cho bảng EDU_TRAIN_SUBJECT (Môn học đào tạo).
 * Port từ /edu/traineducation/courseSubjects (Hanwha_HAE - Hanwha_HTSV không có màn này).
 * MAIN_BUSINESS / MAIN_BUSINESS_NAME: danh sách mã / tên công việc (mã cha 14013573)
 * phân cách dấu phẩy - giữ nguyên định dạng thẻ selectCodeMulti bản gốc.
 */
@Data
public class EduCourseSubject {

    /** SUBJECT_ID - khóa chính, sinh từ EDU_TRAIN_SUBJECT_SEQ */
    private String subjectId;

    @NotBlank(message = "SUBJECT_NO không được để trống")
    private String subjectNo;

    @NotBlank(message = "SUBJECT_NAME không được để trống")
    private String subjectName;

    private String mainBusiness;
    private String mainBusinessName;
}
