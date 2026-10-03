package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.util.List;

/**
 * Chi tiết kế hoạch khi bấm vào lịch đào tạo (trainCalendarDetail bản gốc):
 * thông tin kế hoạch + các cờ riêng của màn này + lịch học của kế hoạch.
 */
@Data
public class EduCalendarDetail {

    private EduPlanManager plan;
    /** ISNOT_TEST - Y/N */
    private String isnotTest;
    /** ISNOT_REPORT - Y/N */
    private String isnotReport;
    /** TRAIN_CONTENT */
    private String trainContent;
    private List<EduTrainSyllabus> syllabus;
}
