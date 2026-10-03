package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Một mục của cây loại báo cáo (/report/ar/viewTrainReport): mã loại báo cáo
 * (SY_CODE con của 14015405) + báo cáo tương ứng trong REPORT_CENTER.
 */
@Data
public class EduTrainReportMenu {

    private String codeNo;
    /** Tên loại báo cáo (nhãn hiển thị trên cây - giống bản gốc) */
    private String content;
    private String reportName;
    /** URL_JSP bản gốc, vd /edu/trainreport/courseTrainReport - frontend map sang loại báo cáo */
    private String urlJsp;
}
