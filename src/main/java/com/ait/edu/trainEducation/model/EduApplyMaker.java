package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * Người phê duyệt (quyết tài) đơn đăng ký khóa đào tạo.
 */
@Data
public class EduApplyMaker {

    private String empid;
    @NotBlank
    private String personId;
    private String localName;
    private String deptName;
    private String postGradeName;
    private String positionName;
}
