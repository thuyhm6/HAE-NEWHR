package com.ait.hrm.empinfo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EmployeeSearchResponse {
    @JsonProperty("personId")
    private String personId;

    @JsonProperty("empId")
    private String empId;

    @JsonProperty("localName")
    private String localName;

    @JsonProperty("deptNo")
    private String deptNo;

    @JsonProperty("deptName")
    private String deptName;

    @JsonProperty("position")
    private String position;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    // Constructors
    public EmployeeSearchResponse() {
    }

    public EmployeeSearchResponse(String personId, String empId, String localName, String deptNo, String position,
            String email, String phone) {
        this.personId = personId;
        this.empId = empId;
        this.localName = localName;
        this.deptNo = deptNo;
        this.position = position;
        this.email = email;
        this.phone = phone;
    }

    // Getters and Setters
    public String getPersonId() {
        return personId;
    }

    public void setPersonId(String personId) {
        this.personId = personId;
    }

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

    public String getDeptNo() {
        return deptNo;
    }

    public void setDeptNo(String deptNo) {
        this.deptNo = deptNo;
    }

    public String getDeptName() {
        return deptName;
    }

    public void setDeptName(String deptName) {
        this.deptName = deptName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "EmployeeSearchResponse{" +
                "personId='" + personId + '\'' +
                ", empId='" + empId + '\'' +
                ", localName='" + localName + '\'' +
                ", deptNo='" + deptNo + '\'' +
                ", position='" + position + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
