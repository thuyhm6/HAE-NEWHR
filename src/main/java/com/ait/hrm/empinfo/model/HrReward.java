package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HrReward Model - Tra cứu khen thưởng (bảng HR_REWARD)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrReward {

    /**
     * Mã khen thưởng (REWARD_NO)
     */
    private Long rewardNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Loại hình khen thưởng (REWARD_TYPE)
     */
    private String rewardType;

    /**
     * Ngày khen thưởng (REWARD_DATE)
     */
    private LocalDate rewardDate;

    /**
     * Cơ quan khen thưởng (REWARD_CNPY)
     */
    private String rewardCnpy;

    /**
     * Phần thưởng/Hiện vật (REWARD)
     */
    private String reward;

    /**
     * Mã loại thưởng (REWARD_TYPE_CODE)
     */
    private String rewardTypeCode;

    /**
     * Ngày chi trả (REWARD_PAY_DATE)
     */
    private LocalDate rewardPayDate;

    /**
     * Hiển thị thẻ nhân sự (PERSONNEL_CARD_INQUIRY) - Y/N
     */
    private String personnelCardInquiry;

    /**
     * Phản ánh vào lương (PAY_APPEAR_ISNOT) - Y/N
     */
    private String payAppearIsnot;

    /**
     * LINE_ID
     */
    private String lineId;

    /**
     * Loại khác (OTHER_TYPE)
     */
    private String otherType;

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
    private LocalDate updatedDate; // Note: Column is UPDATED_DATE based on image
    private String updatedBy;
    private String updatedIp;

    // --- Joined Fields from HR_EMPLOYEE ---
    private String empId;
    private String localName;
    private String deptName;
}
