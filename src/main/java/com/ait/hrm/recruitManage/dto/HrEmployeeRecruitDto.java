package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrEmployeeRecruitDto {

    // Pagination
    private int draw;
    private int start;
    private int length;

    // Search
    private String activity;
    private String searchName;
    private String searchEmpId;

    // Primary key
    private String personId;

    // Thông tin cơ bản
    private String cpnyId;
    private String deptNo;
    private String empId;
    private String localName;
    private String chinesePinyin;
    private String englishName;
    private String koreanName;
    private String sexcode;
    private String dob;
    private String nationalityCode;
    private String nationCode;
    private String maritalStatusCode;
    private String standardPosition;
    private String postFamily;
    private String postGradeNo;
    private String positionNo;
    private String workArea;
    private String empTypeCode;
    private String empCommonTypeCode;
    private String joinType;
    private String joinDetailType;
    private String dateStarted;
    private String confirmWorkDate;
    private String isProbation;
    private String endProbationDate;
    private String contractStartDate;
    private String contractEndDate;
    private String timeStarted;
    private String mainBusiness;
    private String rankStatistics;
    private String productType;
    private String costCenter;
    private String coinCode;
    private String interfaceId;
    private String affirmWorkAge;
    private String nextPromoteDate;
    private String detainLength;
    private String confirmDate;
    private String cancelDate;

    // Thông tin bổ sung
    private String homePhone;
    private String companyPhone;
    private String officePhone;
    private String email;
    private String idcardNo;
    private String documentType;
    private String idcardStartDate;
    private String issuingAuthority;
    private String addressType;
    private String effectiveStartDate;
    private String addressContent;
    private String hujiaddressType;
    private String hujiyouxiaoStartDate;
    private String hujiGuoji;
    private String hujiaddressContent;
    private String nationality;
    private String insuranceType;
    private String insuranceArea;
    private String insuranceDistinguish;
    private String jingshebao;
    private String wageType;
    private String accountNo;
    private String oldPay;
    private String experience;
    private String interested;
    private String characterCode;
    private String recruitType;
    private String workHourType;
    private String dutyNo;
    private String recommend;
    private String lastHaofengDate;
    private String assignmentInformation;
    private String regTypeCode;
    private String regPlace;
    private String religion;
    private String height;
    private String weight;
    private String bloodType;
    private String laetPromotionDate;
    private String origin;
    private String payStepNo;
    private String cvUpdateStatus;
    private String positionConfirmationDate;
    private String isProbationDate;
    private String datGroupEntry;
    private String costStatistics;
    private String filenumber;
    private String jobType;
    private String employeeBelong;
    private String employeeStatus;
    private String graduationAchievement;
    private String averageScore;
    private String languageAbility;
    private String personSupplierCompany;
    private String singId;
    private String existSingle;
    private String shiftNo;
    private String dataSources;
    private String remark;

    // Audit
    private String createDate;
    private String createdBy;
    private String updatedBy;
    private String updateDate;

    // Display (joined)
    private String deptName;
    private String sexName;
    private String nationalityName;
    private String maritalStatusName;
    private String empTypeName;
    private String joinTypeName;
    private String positionName;
    private String postGradeName;
}
