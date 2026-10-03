package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.util.List;

/**
 * Một dòng hồ sơ đào tạo của nhân viên (/edu/traineducation/trainArchives).
 * Port từ trainArchives / trainArchiveshistory (sqlTrainEducation.xml - Hanwha_HTSV).
 */
@Data
public class EduTrainArchive {

    private String empid;
    private String localName;
    private String sexName;
    private String deptName;
    private String postGradeName;
    /** Ngày vào làm - DD/MM/YYYY */
    private String dateStarted;
    private String courseNameCode;
    private String periodTime;
    private String trainContent;
    private String impleClassHour;
    /** 0 = tháng, 1 = ngày, 2 = giờ */
    private String impleClassUnit;
    private String impleStartDate;
    private String impleEndDate;
    private String departManaName;
    private String trainAddress;
    /** Thành tích tổng hợp = điểm thi * 0.6 + điểm đánh giá TB * 0.4 */
    private String evaResult;
    private String allCost;
    /** RESULT_NO - dùng lấy file báo cáo (ESS_FILE APPLY_TYPE = eduTrainResult) */
    private String resultNo;
    /** Dữ liệu cũ từ EDU_TRAIN_BASIC_HISTORY */
    private boolean history;
    private List<EduFile> files;
}
