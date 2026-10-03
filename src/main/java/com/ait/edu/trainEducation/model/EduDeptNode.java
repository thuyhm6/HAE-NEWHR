package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Node phòng ban (HR_DEPARTMENT) toàn công ty - dùng cho cây chọn phòng ban
 * ở các màn đào tạo (tương đương edu.traineducation.getDeptTree bản gốc).
 */
@Data
public class EduDeptNode {
    private String deptNo;
    private String parentDeptNo;
    private String deptName;
}
