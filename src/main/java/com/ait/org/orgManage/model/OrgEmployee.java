package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrgEmployee {
    private String resumeNo;
    private String empId;
    private String chinesePinyin;
    private String englishName;
    private String positionNo;
    private String dutyNo;
    private String postNo;
    private String statusCode;
    private LocalDate dateStarted;
    private LocalDate dateLeft;
    private LocalDate endProbationDate;
    private String empTypeCode;
    private String cpnyId;
    private String personId;
    private String deptNo;
    private String localName;
    private String workArea;
    private String idCardNo;
    private String shiftNo;
    private String empOffice;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private String mainBusiness;
    private String experience;
    private String incumbency;
    private String promotionDay; // Defined as VARCHAR2 in schema? "PROMOTION_DAY VARCHAR2(30)" - wait, schema
                                 // says VARCHAR2(30) but name implies Date. I'll stick to String as per schema
                                 // or Date? Schema says VARCHAR2(30). I'll use String.
    private String updatedIp;
    private String createdIp;
    private String koreanName;
    private String standardPosition;
    private String empCommonTypeCode;
    private String affirmWorkAge;
    private String workHourType;
    private String directIndirectDistinction;
    private String recruitType;
    private String insuranceType;
    private String insuranceArea;
    private String fileNumber;
    private String employeeOwned;
    private String wageType;
    private String position;
    private String dateLastUp; // VARCHAR2(50) per schema
    private String postGradeNo;
    private String postFamily;
    private String oldDeptNo;
}
