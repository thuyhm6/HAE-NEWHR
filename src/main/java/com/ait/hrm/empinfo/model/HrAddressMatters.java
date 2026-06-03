package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * HrAddressMatters Model - Tra cứu địa chỉ (bảng HR_ADDRESS_MATTERS)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrAddressMatters {

    /**
     * Mã số địa chỉ (ADDRESS_NO)
     */
    private Long addressNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Loại địa chỉ (ADDRESS_TYPE)
     */
    private String addressType;

    private String addressTypeName; // Tên loại địa chỉ (từ get_global_name)

    /**
     * Ngày bắt đầu hiệu lực (EFFECTIVE_START_DATE)
     */
    private LocalDate effectiveStartDate;

    /**
     * Nội dung địa chỉ (ADDRESS_CONTENT)
     */
    private String addressContent;

    /**
     * Trạng thái hoạt động (ACTIVITY)
     */
    private Integer activity;

    /**
     * Quốc gia (NATIONALITY)
     */
    private String nationality;

    private String nationalityName; // Tên quốc gia (từ get_global_name)

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
