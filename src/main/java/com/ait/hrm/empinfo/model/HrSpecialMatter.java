package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrSpecialMatter {
    private String specialNo;
    private String personId;
    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;
    private Integer activity;
    private LocalDateTime registrationDate;
    private String inforDisCode;
    private String generationTitle;
    private String specialContent;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer otFlag;

    // Employee info from hr_employee table
    private String empId;
    private String localName;
    private String deptNo;
    private String position;

    public HrSpecialMatter(String specialNo, String personId, LocalDateTime createDate,
            String createdBy, String createdIp, LocalDateTime updateDate,
            String updatedBy, String updatedIp, Integer activity,
            LocalDateTime registrationDate, String inforDisCode,
            String generationTitle, String specialContent,
            LocalDate startDate, LocalDate endDate, Integer otFlag) {
        this.specialNo = specialNo;
        this.personId = personId;
        this.createDate = createDate;
        this.createdBy = createdBy;
        this.createdIp = createdIp;
        this.updateDate = updateDate;
        this.updatedBy = updatedBy;
        this.updatedIp = updatedIp;
        this.activity = activity;
        this.registrationDate = registrationDate;
        this.inforDisCode = inforDisCode;
        this.generationTitle = generationTitle;
        this.specialContent = specialContent;
        this.startDate = startDate;
        this.endDate = endDate;
        this.otFlag = otFlag;
    }

    @Override
    public String toString() {
        return "HrSpecialMatter{" +
                "specialNo='" + specialNo + '\'' +
                ", personId='" + personId + '\'' +
                ", createDate=" + createDate +
                ", createdBy='" + createdBy + '\'' +
                ", createdIp='" + createdIp + '\'' +
                ", updateDate=" + updateDate +
                ", updatedBy='" + updatedBy + '\'' +
                ", updatedIp='" + updatedIp + '\'' +
                ", activity='" + activity + '\'' +
                ", registrationDate=" + registrationDate +
                ", inforDisCode='" + inforDisCode + '\'' +
                ", generationTitle='" + generationTitle + '\'' +
                ", specialContent='" + specialContent + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", otFlag='" + otFlag + '\'' +
                ", empId='" + empId + '\'' +
                ", localName='" + localName + '\'' +
                ", deptNo='" + deptNo + '\'' +
                ", position='" + position + '\'' +
                '}';
    }
}
