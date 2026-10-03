package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.util.List;

/**
 * Phiếu học viên đánh giá khóa học (EDU_TRAIN_RESULT). Các tiêu chí chấm 1-5:
 * DIFFICULTY = mức độ hài lòng chung, CONTENT_RICH = mức độ dễ nắm bắt,
 * TIME_MODERATE = thời lượng, PRACTICABILITY = tính thực dụng (theo SQL bản gốc).
 */
@Data
public class EduTrainResult {
    private String resultNo;
    private String basicNo;
    private String stuEmpid;
    private String stuLocalName;
    private String difficulty;
    private String contentRich;
    private String practicability;
    private String timeModerate;
    private String allscore;
    private String otherAdvise;

    /** (Không lưu DB) Báo cáo đào tạo đính kèm theo phiếu */
    private List<EduFile> files;
}
