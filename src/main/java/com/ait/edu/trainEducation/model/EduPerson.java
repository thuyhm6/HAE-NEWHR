package com.ait.edu.trainEducation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Cặp mã NV + họ tên (học viên / giảng viên) dùng trong Thông tin đào tạo cơ bản.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EduPerson {
    private String empid;
    private String name;
    private String deptName;

    public EduPerson(String empid, String name) {
        this.empid = empid;
        this.name = name;
    }
}
