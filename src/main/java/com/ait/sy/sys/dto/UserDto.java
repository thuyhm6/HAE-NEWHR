package com.ait.sy.sys.dto;

import com.ait.validation.ValidUsername;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * UserDto - Data Transfer Object cho User
 */
public class UserDto extends BaseDto {

    @NotBlank(message = "User number không được để trống")
    private String userNo;

    @NotBlank(message = "Username không được để trống")
    @ValidUsername
    @Size(min = 3, max = 50, message = "Username phải có độ dài từ 3 đến 50 ký tự")
    private String username;

    @JsonIgnore
    @NotBlank(message = "Password không được để trống")
    @Size(min = 8, message = "Password phải có ít nhất 8 ký tự")
    private String password;

    @JsonProperty("password")
    @NotBlank(message = "Password không được để trống", groups = { CreateGroup.class })
    @Size(min = 8, message = "Password phải có ít nhất 8 ký tự", groups = { CreateGroup.class })
    private String newPassword;

    @NotBlank(message = "Person ID không được để trống")
    private String personId;

    @NotNull(message = "Activity status không được null")
    private Integer activity;

    private String cpnyId;
    private String userType;

    private LocalDateTime lastLogin;

    // Employee information
    private String employeeName;
    private String departmentName;
    private String position;

    // Validation groups
    public interface CreateGroup {
    }

    public interface UpdateGroup {
    }

    // Constructors
    public UserDto() {
    }

    public UserDto(String userNo, String username, String personId) {
        this.userNo = userNo;
        this.username = username;
        this.personId = personId;
    }

    // Getters and Setters
    public String getUserNo() {
        return userNo;
    }

    public void setUserNo(String userNo) {
        this.userNo = userNo;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getPersonId() {
        return personId;
    }

    public void setPersonId(String personId) {
        this.personId = personId;
    }

    public Integer getActivity() {
        return activity;
    }

    public void setActivity(Integer activity) {
        this.activity = activity;
    }

    public String getCpnyId() {
        return cpnyId;
    }

    public void setCpnyId(String cpnyId) {
        this.cpnyId = cpnyId;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    // Utility methods
    public boolean isActive() {
        return activity != null && activity == 1;
    }

    public void setActive(boolean active) {
        this.activity = active ? 1 : 0;
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "userNo='" + userNo + '\'' +
                ", username='" + username + '\'' +
                ", personId='" + personId + '\'' +
                ", activity=" + activity +
                '}';
    }
}
