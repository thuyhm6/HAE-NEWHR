package com.ait.hrm.contract.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Model class for HR Contract information
 * Maps to hr_contract table
 */
public class HrContract {
    private String contractNo;
    private String personId;
    private String contractTypeCode;
    private String contractTypeName;
    private LocalDate startContractDate;
    private LocalDate endContractDate;
    private String remark;
    private String workTime;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer orderno;
    private String activity;
    private String createdIp;
    private String updatedIp;
    private String workPosition;
    private String workContent;
    private BigDecimal salary;
    private String deptNo;
    private String positionNo;
    private String postGradeNo;
    private String workHourType;
    private String totalPeriod;
    private String contractName;
    private LocalDate changeDate;
    private String contractType;
    private String totalPeriod08;

    // Employee info from hr_employee table (for joins)
    private String empId;
    private String localName;
    private String currentDeptNo;
    private String position;

    // Constructors
    public HrContract() {
    }

    public HrContract(String contractNo, String personId, String contractTypeCode,
            String contractTypeName,
            LocalDate startContractDate, LocalDate endContractDate,
            String remark, String workTime, LocalDateTime createDate,
            String createdBy, LocalDateTime updateDate, String updatedBy,
            Integer orderno, String activity, String createdIp, String updatedIp,
            String workPosition, String workContent, BigDecimal salary,
            String deptNo, String positionNo, String postGradeNo,
            String workHourType, String totalPeriod, String contractName,
            LocalDate changeDate, String contractType, String totalPeriod08) {
        this.contractNo = contractNo;
        this.personId = personId;
        this.contractTypeCode = contractTypeCode;
        this.contractTypeName = contractTypeName;
        this.startContractDate = startContractDate;
        this.endContractDate = endContractDate;
        this.remark = remark;
        this.workTime = workTime;
        this.createDate = createDate;
        this.createdBy = createdBy;
        this.updateDate = updateDate;
        this.updatedBy = updatedBy;
        this.orderno = orderno;
        this.activity = activity;
        this.createdIp = createdIp;
        this.updatedIp = updatedIp;
        this.workPosition = workPosition;
        this.workContent = workContent;
        this.salary = salary;
        this.deptNo = deptNo;
        this.positionNo = positionNo;
        this.postGradeNo = postGradeNo;
        this.workHourType = workHourType;
        this.totalPeriod = totalPeriod;
        this.contractName = contractName;
        this.changeDate = changeDate;
        this.contractType = contractType;
        this.totalPeriod08 = totalPeriod08;
    }

    // Getters and Setters
    public String getContractNo() {
        return contractNo;
    }

    public void setContractNo(String contractNo) {
        this.contractNo = contractNo;
    }

    public String getPersonId() {
        return personId;
    }

    public void setPersonId(String personId) {
        this.personId = personId;
    }

    public String getContractTypeCode() {
        return contractTypeCode;
    }

    public void setContractTypeCode(String contractTypeCode) {
        this.contractTypeCode = contractTypeCode;
    }

    public String getContractTypeName() {
        return contractTypeName;
    }

    public void setContractTypeName(String contractTypeName) {
        this.contractTypeName = contractTypeName;
    }

    public LocalDate getStartContractDate() {
        return startContractDate;
    }

    public void setStartContractDate(LocalDate startContractDate) {
        this.startContractDate = startContractDate;
    }

    public LocalDate getEndContractDate() {
        return endContractDate;
    }

    public void setEndContractDate(LocalDate endContractDate) {
        this.endContractDate = endContractDate;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getWorkTime() {
        return workTime;
    }

    public void setWorkTime(String workTime) {
        this.workTime = workTime;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Integer getOrderno() {
        return orderno;
    }

    public void setOrderno(Integer orderno) {
        this.orderno = orderno;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public String getCreatedIp() {
        return createdIp;
    }

    public void setCreatedIp(String createdIp) {
        this.createdIp = createdIp;
    }

    public String getUpdatedIp() {
        return updatedIp;
    }

    public void setUpdatedIp(String updatedIp) {
        this.updatedIp = updatedIp;
    }

    public String getWorkPosition() {
        return workPosition;
    }

    public void setWorkPosition(String workPosition) {
        this.workPosition = workPosition;
    }

    public String getWorkContent() {
        return workContent;
    }

    public void setWorkContent(String workContent) {
        this.workContent = workContent;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public String getDeptNo() {
        return deptNo;
    }

    public void setDeptNo(String deptNo) {
        this.deptNo = deptNo;
    }

    public String getPositionNo() {
        return positionNo;
    }

    public void setPositionNo(String positionNo) {
        this.positionNo = positionNo;
    }

    public String getPostGradeNo() {
        return postGradeNo;
    }

    public void setPostGradeNo(String postGradeNo) {
        this.postGradeNo = postGradeNo;
    }

    public String getWorkHourType() {
        return workHourType;
    }

    public void setWorkHourType(String workHourType) {
        this.workHourType = workHourType;
    }

    public String getTotalPeriod() {
        return totalPeriod;
    }

    public void setTotalPeriod(String totalPeriod) {
        this.totalPeriod = totalPeriod;
    }

    public String getContractName() {
        return contractName;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public LocalDate getChangeDate() {
        return changeDate;
    }

    public void setChangeDate(LocalDate changeDate) {
        this.changeDate = changeDate;
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public String getTotalPeriod08() {
        return totalPeriod08;
    }

    public void setTotalPeriod08(String totalPeriod08) {
        this.totalPeriod08 = totalPeriod08;
    }

    // Employee info getters and setters
    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

    public String getLocalName() {
        return localName;
    }

    public void setLocalName(String localName) {
        this.localName = localName;
    }

    public String getCurrentDeptNo() {
        return currentDeptNo;
    }

    public void setCurrentDeptNo(String currentDeptNo) {
        this.currentDeptNo = currentDeptNo;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    @Override
    public String toString() {
        return "HrContract{" +
                "contractNo='" + contractNo + '\'' +
                ", personId='" + personId + '\'' +
                ", contractTypeCode='" + contractTypeCode + '\'' +
                ", contractTypeName='" + contractTypeName + '\'' +
                ", startContractDate=" + startContractDate +
                ", endContractDate=" + endContractDate +
                ", remark='" + remark + '\'' +
                ", workTime='" + workTime + '\'' +
                ", createDate=" + createDate +
                ", createdBy='" + createdBy + '\'' +
                ", updateDate=" + updateDate +
                ", updatedBy='" + updatedBy + '\'' +
                ", orderno=" + orderno +
                ", activity='" + activity + '\'' +
                ", createdIp='" + createdIp + '\'' +
                ", updatedIp='" + updatedIp + '\'' +
                ", workPosition='" + workPosition + '\'' +
                ", workContent='" + workContent + '\'' +
                ", salary=" + salary +
                ", deptNo='" + deptNo + '\'' +
                ", positionNo='" + positionNo + '\'' +
                ", postGradeNo='" + postGradeNo + '\'' +
                ", workHourType='" + workHourType + '\'' +
                ", totalPeriod='" + totalPeriod + '\'' +
                ", contractName='" + contractName + '\'' +
                ", changeDate=" + changeDate +
                ", contractType='" + contractType + '\'' +
                ", totalPeriod08='" + totalPeriod08 + '\'' +
                ", empId='" + empId + '\'' +
                ", localName='" + localName + '\'' +
                ", currentDeptNo='" + currentDeptNo + '\'' +
                ", position='" + position + '\'' +
                '}';
    }
}
