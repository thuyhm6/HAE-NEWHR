package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Một đơn đăng ký khóa đào tạo kèm trạng thái phê duyệt / xác nhận
 * (courseMaker, courseConfirm, makerSituation, makerSituationHUB).
 */
@Data
public class EduApplyRecord {

    private String makerNo;
    private String applyNo;
    private String basicNo;
    private String planNo;
    private Integer syllabusCount;
    private String makerPersonId;
    private String makerLocalName;
    /** Phê duyệt: 1 = chưa duyệt, 2 = đã duyệt, 0 = từ chối */
    private String applyFlag;
    /** Xác nhận: 1 = chờ xác nhận, 2 = đã xác nhận, 0 = từ chối */
    private String confirmFlag;
    private String makerLevel;
    /** Ngày đăng ký - DD/MM/YYYY */
    private String createDate;
    private String empid;
    private String stuPersonId;
    private String stuLocalName;
    private String deptName;
    private String postGradeName;
    private String trainTypeCodeName;
    private String courseNameCode;
    private String periodTime;
    private String impleStartDate;
    private String impleEndDate;
    private String impleClassHour;
    private String impleClassUnit;
    private String applyTask;
    /** Số đơn đã đăng ký của khóa */
    private Integer applyCount;
    /** Số nhân viên dự kiến (PLAN_EMPLOYEE_EMPID của khóa) */
    private Integer plannedCount;
}
