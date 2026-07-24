package com.ait.evs.manage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO thông tin đánh giá nhân viên (bảng EVS_OBJECT)
 */
@Data
@NoArgsConstructor
public class EvsObjectDto {

    private String seq;
    private String resumeSeq;
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private LocalDate dateStarted;
    private String activity;

    private String objectType;
    private String objectTypeName;
    private String mainBusiness;
    private String mainBusinessName;
    private String listType;
    private String listTypeName;
    private String evsGroup;
    private String evsGroupName;
    private String evsOccGroup;
    private String evsOccGroupName;
    private String finalGrade;
    private String finalAffirmContent;
    private Integer ordernoDept;
    private String evsType;
    private String evsTypeName;
    private String evsYear;
    private String evsMonth;
    private String evsMonthName;
    private String evsCycle;
    private String evsCycleName;
    private Integer orderno;

    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;
}
