package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Điều kiện lọc chung cho các báo cáo đào tạo (TrainReportCtroller bản gốc).
 */
@Data
public class EduTrainReportQuery {

    /** Báo cáo theo khóa học */
    private String trainDiffCode;
    private String trainTypeCode;
    private String courseName;
    /** Báo cáo theo chức vụ */
    private String postGradeName;
    /** Báo cáo theo phòng ban (gồm phòng ban con) */
    private String deptNo;
    /** Báo cáo theo năm - YYYY */
    private String year;
    /** Báo cáo theo tháng - MMYYYY (giữ định dạng bản gốc) */
    private String month;
    /** Báo cáo theo hình thức */
    private String trainFormCode;
}
