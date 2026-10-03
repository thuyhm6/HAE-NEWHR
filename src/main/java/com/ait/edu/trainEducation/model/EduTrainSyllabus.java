package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Model cho bảng EDU_TRAIN_SYLLABUS (Lịch học của kế hoạch đào tạo).
 * courseDate dạng DD/MM/YYYY, courseStartDate/courseEndDate dạng HH24:MI.
 */
@Data
public class EduTrainSyllabus {
    private String syllNo;
    private String planNo;
    private String courseNameCode;
    private String courseDate;
    private String courseStartDate;
    private String courseEndDate;
    private String detailAddress;
}
