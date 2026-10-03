package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Kế hoạch đào tạo chưa lập khóa (EDU_PLAN_MANAGER.ACTIVITY = 1) - dropdown
 * "Chương trình đào tạo" khi thêm Thông tin đào tạo cơ bản (planManager_basic bản gốc).
 */
@Data
public class EduBasicPlanOption {
    private String planNo;
    private String trainTypeCodeName;
    private String courseNumber;
    private String courseNameCode;
    private String periodTime;
}
