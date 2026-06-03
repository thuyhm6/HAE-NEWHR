package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * HrEmergencyAddress Model - Tra cứu địa chỉ khẩn cấp (bảng
 * HR_EMERGENCY_ADDRESS)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrEmergencyAddress {

    /**
     * Mã số khẩn cấp (EMERGENCY_NO)
     */
    private Long emergencyNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Tên người liên hệ (EMER_NAME)
     */
    private String emerName;

    /**
     * SĐT 1 (EMER_PHONE)
     */
    private String emerPhone;

    /**
     * SĐT 2 (EMER_PHONE_SECOND)
     */
    private String emerPhoneSecond;

    /**
     * Email (EMER_EMAIL)
     */
    private String emerEmail;

    /**
     * Văn phòng liên lạc chính (MAIN_LIAISON_OFFICE) - Y/N
     */
    private String mainLiaisonOffice;

    /**
     * Địa chỉ (EMER_ADDRESS)
     */
    private String emerAddress;

    /**
     * Quan hệ (EMER_TYPE_CODE)
     */
    private String emerTypeCode;

    private String emerTypeName; // Tên quan hệ (từ get_global_name)

    /**
     * Hoạt động (ACTIVITY)
     */
    private Integer activity;

    /**
     * Là địa chỉ khẩn cấp chính (ISEMERGENCYADDRESS) - 1/0
     */
    private String isEmergencyAddress;

    /**
     * Quốc gia (NATIONALITY)
     */
    private String nationality;

    /**
     * Di động (EMER_CELLPHONE)
     */
    private String emerCellphone;

    /**
     * ĐT công việc (EMER_WORK_PHONE)
     */
    private String emerWorkPhone;

    /**
     * Địa chỉ liên hệ chính (MAIN_CONTACT_ADDRESS)
     */
    private String mainContactAddress;

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
