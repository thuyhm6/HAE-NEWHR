package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Dòng danh sách khóa đào tạo ở các màn đánh giá (Đánh giá học viên / Đánh giá
 * giảng viên / Kết quả đào tạo) - dựa trên trainBasicInformation bản gốc.
 */
@Data
public class EduEvalCourse {
    private String basicNo;
    private String trainTypeCodeName;
    private String courseNameCode;
    private String periodTime;
    private String impleClassHour;
    private String impleClassUnit;
    private String impleStartDate;
    private String impleEndDate;
    private String trainContent;

    /** Số học viên đã có điểm thi (pingjiacount bản gốc) */
    private Integer studentEvalCount;
    /** Số phiếu kết quả đào tạo đã đánh giá (trainresultcount bản gốc) */
    private Integer resultEvalCount;
    /** Số học viên của khóa */
    private Integer studentCount;
    /** RESULT_NO của người đăng nhập (nếu là học viên) */
    private String resultNo;
    /** Khóa đang được đánh giá (bản gốc tô xanh tên khóa) */
    private Boolean inProgress;
    /** Được mở màn đánh giá kết quả đào tạo (flag bản gốc) */
    private Boolean canEvaluate;
}
