package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Học viên của khóa đào tạo (EDU_FREE_EMPLOYEE).
 * FLAG: 1 = NV chỉ định, 2 = NV tự chọn, 3 = NV đăng ký đã được duyệt.
 */
@Data
public class EduFreeEmployee {
    private String freeNo;
    private String basicNo;
    private String empid;
    private String localName;
    private String flag;
    private String deptName;
    private String postGradeName;
    /** EVA_RESULT - điểm thi (0-100) */
    private String evaResult;
}
