package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Khóa đào tạo nhân viên có thể đăng ký (/edu/traineducation/courseApply).
 * Port từ courseApply (sqlTrainEducation.xml - Hanwha_HTSV).
 */
@Data
public class EduApplyCourse {

    private String basicNo;
    private String planNo;
    private Integer syllabusCount;
    private String trainTypeCodeName;
    private String courseNameCode;
    private String periodTime;
    private String trainFormCodeName;
    private String trainAddress;
    private String impleStartDate;
    private String impleEndDate;
    private String impleClassHour;
    /** 0 = tháng, 1 = ngày, 2 = giờ */
    private String impleClassUnit;
    private String trainContent;
    /** Số đơn đã đăng ký */
    private Integer applyCount;
    /** Số nhân viên được chỉ định (DES_EMPLOYEE của kế hoạch) */
    private Integer designatedCount;
}
