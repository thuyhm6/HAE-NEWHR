package com.ait.sy.sys.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * EmployeeDto - Data Transfer Object cho Employee
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeDto extends BaseDto {

    @NotBlank(message = "Person ID không được để trống")
    private String personId;

    @NotBlank(message = "Tên nhân viên không được để trống")
    @Size(max = 100, message = "Tên nhân viên không được quá 100 ký tự")
    private String localName;

    @Size(max = 100, message = "Tên tiếng Anh không được quá 100 ký tự")
    private String englishName;

    @NotBlank(message = "Mã phòng ban không được để trống")
    private String deptNo;

    @Size(max = 50, message = "Chức vụ không được quá 50 ký tự")
    private String position;

    private LocalDate hireDate;

    private LocalDate leaveDate;

    @NotNull(message = "Trạng thái hoạt động không được null")
    private Integer activity;

    // Department information
    private String departmentName;

    // Personal information
    private String email;
    private String phone;
    private String address;
    private String gender;

    private LocalDate birthDate;

    // Validation groups
    public interface CreateGroup {
    }

    public interface UpdateGroup {
    }

    // Constructors
    public EmployeeDto() {
    }

    public EmployeeDto(String personId, String localName, String deptNo) {
        this.personId = personId;
        this.localName = localName;
        this.deptNo = deptNo;
    }

    // Getters and Setters
    public String getPersonId() {
        return personId;
    }

    public void setPersonId(String personId) {
        this.personId = personId;
    }

    public String getLocalName() {
        return localName;
    }

    public void setLocalName(String localName) {
        this.localName = localName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getDeptNo() {
        return deptNo;
    }

    public void setDeptNo(String deptNo) {
        this.deptNo = deptNo;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public LocalDate getLeaveDate() {
        return leaveDate;
    }

    public void setLeaveDate(LocalDate leaveDate) {
        this.leaveDate = leaveDate;
    }

    public Integer getActivity() {
        return activity;
    }

    public void setActivity(Integer activity) {
        this.activity = activity;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    // Utility methods
    public boolean isActive() {
        return activity != null && activity == 1;
    }

    public void setActive(boolean active) {
        this.activity = active ? 1 : 0;
    }

    public boolean isEmployed() {
        return leaveDate == null;
    }

    @Override
    public String toString() {
        return "EmployeeDto{" +
                "personId='" + personId + '\'' +
                ", localName='" + localName + '\'' +
                ", deptNo='" + deptNo + '\'' +
                ", position='" + position + '\'' +
                ", activity=" + activity +
                '}';
    }
}
