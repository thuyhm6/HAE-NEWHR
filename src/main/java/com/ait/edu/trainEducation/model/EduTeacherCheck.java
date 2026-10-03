package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Phiếu học viên đánh giá giảng viên (EDU_TEACHER_CHECK). GROOMING = điểm 1-5
 * (bản HTSV chỉ dùng cột này, nhập qua Excel).
 */
@Data
public class EduTeacherCheck {
    private String checkNo;
    private String basicNo;
    private String teaEmpid;
    private String teaLocalName;
    private String teaDeptName;
    private String teaPostGradeName;
    private String stuEmpid;
    private String stuLocalName;
    private String grooming;
    private String allscore;
    private String otherAdvise;
}
