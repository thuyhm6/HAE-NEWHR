package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Nhân viên đang làm việc (HR_EMPLOYEE.EMP_OFFICE = '15119') dùng cho các popup
 * chọn nhân viên: desEmployee / queryTeacher / queryPeixun bản gốc.
 */
@Data
public class EduEmployeeLookup {
    private String personId;
    private String empid;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postGradeName;
    private String positionName;
}
