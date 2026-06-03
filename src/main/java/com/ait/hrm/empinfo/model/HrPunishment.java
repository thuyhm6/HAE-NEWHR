package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HrPunishment Model - Tra cứu kỷ luật (bảng HR_PUNISHMENT)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrPunishment {

    /**
     * Mã kỷ luật (PUNISH_NO)
     */
    private Long punishNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Ngày kỷ luật (PUNISH_DATE)
     */
    private LocalDate punishDate;

    /**
     * Mã loại kỷ luật (PUNISH_CODE) - Loại kỷ luật
     */
    private String punishCode;

    /**
     * Lý do kỷ luật (PUNISH_REASON)
     */
    private String punishReason;

    /**
     * Ngày gỡ bỏ/Ngày hết hạn (RELEASE_DATE)
     */
    private LocalDate releaseDate;

    /**
     * Cơ quan/Bộ phận kỷ luật (PUNISH_DEPARTMENT)
     */
    private String punishDepartment;

    /**
     * Điểm kỷ luật/Phạt (PUNISH_SCORE)
     */
    private String punishScore;

    /**
     * Ngày bắt đầu giảm lương (PAYCUT_START_DATE)
     */
    private LocalDate paycutStartDate;

    /**
     * Ngày kết thúc giảm lương (PAYCUT_END_DATE)
     */
    private LocalDate paycutEndDate;

    /**
     * Hiển thị thẻ nhân sự (PERSONNEL_CARD_INQUIRY) - Y/N
     */
    private String personnelCardInquiry;

    /**
     * Mã loại lỗi (FAULT_TYPE_CODE)
     */
    private String faultTypeCode;

    /**
     * Ghi chú (REMARKS)
     */
    private String remarks;

    /**
     * Trạng thái (ACTIVITY)
     */
    private Integer activity;

    // Audit fields
    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate; // NOTE: Column name is UPDATE_DATE in image
    private String updatedBy;
    private String updatedIp;

    // --- Joined Fields from HR_EMPLOYEE ---
    private String empId;
    private String localName;
    private String deptName;
}
