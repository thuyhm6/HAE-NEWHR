package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Thống kê tỉ lệ đánh giá theo 5 mức (Rất tốt .. Kém) - thay cho các cột
 * REV_05..REV_01, REV_TOTAL tính bằng SQL ở bản gốc.
 * Dùng cho: từng giảng viên (Đánh giá giảng viên) và từng tiêu chí (Kết quả đào tạo).
 */
@Data
public class EduScoreStat {
    /** Mã tiêu chí (Kết quả đào tạo) hoặc mã NV giảng viên */
    private String key;
    private String name;
    private String deptName;
    private String postGradeName;
    /** Số phiếu đã chấm */
    private int evaluatedCount;
    private String rev05;
    private String rev04;
    private String rev03;
    private String rev02;
    private String rev01;
    /** Mức độ hài lòng = tỉ lệ Rất tốt + Tốt */
    private String revTotal;
}
