package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Một dòng báo cáo đào tạo tổng hợp (course/postGrade/dept/year/month/form).
 */
@Data
public class EduTrainReportRow {

    /** Tên nhóm: chức vụ / phòng ban / năm / tháng / hình thức (tùy loại báo cáo) */
    private String groupName;
    private String trainDiffName;
    private String trainTypeName;
    private String courseNameCode;
    private String trainFormName;
    /** Số khóa học */
    private BigDecimal counts;
    /** Số người đào tạo */
    private BigDecimal numb;
    /** Số khóa bình quân / người */
    private BigDecimal avgCounts;
    /** Tổng thời gian (giờ) */
    private BigDecimal allTime;
    /** Thời gian * số người */
    private BigDecimal totalPt;
    /** Thời gian bình quân */
    private BigDecimal avgTime;
    private BigDecimal allCost;
    private BigDecimal directCost;
    private BigDecimal indirectCost;
    private BigDecimal avgCost;
}
