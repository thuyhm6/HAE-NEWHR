package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HrPersonalInfo - Model cho bảng hr_personal_info
 * Liên kết 1-1 với HrEmployee thông qua PERSON_ID
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrPersonalInfo {

    private String personId;
    private String finalDegreeCode;
    private String finalDegreeName;
    private String sexCode;
    private String sexName;
    private LocalDate dob;
    private String nationCode;
    private String nationName;
    private String nationalityCode;
    private String nationalityName;
    private String maritalStatusCode;
    private String maritalStatusName;
    private LocalDate weddingDate;
    private String idcardNo;
    private String homeAddress;
    private String email;
    private String regTypeCode;
    private String regPlace;
    private String officePhone;
    private String homePhone;
    private String cellphone;
    private String photoPath;
    private String houseTp;
    private LocalDate weddDate;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer orderNo;
    private String activity;
    private String residentialDistinction;
    private String existSingle;
    private String singId;
    private String companyPhone;
    private String emailSecond;
    private String fileLocation;
    private LocalDate fileEnter;
    private LocalDate fileOut;
    private String createdIp;
    private String updatedIp;
    private String contactPhone;
    private String ext;
    private String interested;
    private String oldDepartment;
    private String marriageSupplement;
    private String characterCode;
    private String safeTypeCode;
    private String politicalStatus;
    private String childrenCode;
    private String safeAddressCode;
    private String insuranceDistinguish;
    private String idcardExpireDate;
    private String longTerm;
    private String remark;
    private String groupResidence;
    private String insuranceXz;
    private String documentType;
    private String religion;
    private String origin;
    private String idcardStartDate;
    private String becomeRegularEvaluate;
    private String politicalOutlook;
    private String issuingAuthority;
    private String cvUpdateStatus;
    private String armyOrNot;
    private String obstacleOrNot;
    private String graduationAchievement;
    private String averageScore;
    private String languageAbility;
    private String height;
    private String weight;
    private String personSupplierCompany;

    public HrPersonalInfo(String personId) {
        this.personId = personId;
    }

    @Override
    public String toString() {
        return "HrPersonalInfo{" +
                "personId='" + personId + '\'' +
                ", finalDegreeCode='" + finalDegreeCode + '\'' +
                ", sexCode='" + sexCode + '\'' +
                ", dob=" + dob +
                ", idcardNo='" + idcardNo + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
