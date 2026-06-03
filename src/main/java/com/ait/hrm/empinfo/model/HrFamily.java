package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HrFamily Model - Tra cứu gia đình (bảng HR_FAMILY)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrFamily {

    /**
     * Mã số gia đình (FAMILY_NO)
     */
    private Long familyNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Quan hệ (FAM_TYPE_CODE)
     */
    private String famTypeCode;
    private String famTypeName; // Tên quan hệ (từ get_global_name)

    /**
     * Tên người thân (FAM_NAME)
     */
    private String famName;

    /**
     * Ngày sinh (FAM_BORNDATE)
     */
    private LocalDate famBorndate;

    /**
     * CCCD/CMND (FAM_IDCARD)
     */
    private String famIdcard;

    /**
     * Số điện thoại (FAM_PHONE)
     */
    private String famPhone;

    /**
     * Nơi làm việc (FAM_COMPANY_NAME)
     */
    private String famCompanyName;

    /**
     * Sống cùng (LIVE_YN) - Y/N
     */
    private String liveYn;

    /**
     * Liên hệ khẩn cấp (EMERGENCY_CONTACT_YN) - Y/N
     */
    private String emergencyContactYn;

    /**
     * Mã NV người thân (FAM_PERSON_ID)
     */
    private String famPersonId;

    /**
     * Địa chỉ (FAM_ADDRESS)
     */
    private String famAddress;
    /**
     * Âm lịch (FAM_YINYANGLI)
     */    
    private String famYinyangli;

    /**
     * Giảm trừ gia cảnh (TAX_YN) - Y/N
     */
    private String taxYn;

    /**
     * Giới tính (GENDER)
     */
    private String gender;
    private String genderName; // Tên giới tính (từ get_global_name)

    /**
     * Mã bưu chính (ADDRESS_POSTAL)
     */    
    private String addressPostal;

    /**
     * Trình độ học vấn (FAM_EDUCATION)
     */
    private String famEducation;

    /**
     * Là địa chỉ khẩn cấp (ISEMERGENCYADDRESS)
     */
    private String isEmergencyAddress;

    /**
     * Quốc tịch (NATIONALITY)
     */
    private String nationality;
    private String nationalityName; // Tên quốc tịch (từ get_global_name)

    /**
     * Số điện thoại công việc (WORK_PHONE)
     */
    private String workPhone;

    /**
     * Email (FAM_EMAIL)
     */
    private String famEmail;

    /**
     * Nghề nghiệp (OCUPATION)
     */
    private String ocupation;

    /**
     * Ghi chú (REMARKS)
     */
    private String remarks;

    /**
     * Trạng thái hoạt động (ACTIVITY)
     */
    private Integer activity;

    // Audit fields
    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;

    // --- Joined Fields from HR_EMPLOYEE ---
    private String empId;
    private String localName;
    private String deptName;
}
