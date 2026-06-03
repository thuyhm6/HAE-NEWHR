package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDateTime;

/**
 * HrWorkExperience Model - Thông tin kinh nghiệm làm việc (bảng
 * hr_work_experience)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrWorkExperience {

    /**
     * Mã số kinh nghiệm làm việc (WORK_EXPER_NO)
     */
    private Long workExpNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Tên công ty cũ (CPNY_NAME)
     */
    private String cpnyName;

    /**
     * Tên bộ phận (DEPT_NAME)
     */
    private String deptName;

    /**
     * Chức vụ (POSITION)
     */
    private String position;

    /**
     * Nhiệm vụ/Công việc (DUTY)
     */
    private String duty;

    /**
     * Mức lương (PAY_YEAR)
     */
    private String payYear;

    /**
     * Lý do nghỉ việc (RESIGN_REASON)
     */
    private String resignReason;

    /**
     * Người làm chứng (WITNESS)
     */
    private String witness;

    /**
     * Số điện thoại liên hệ (CELLPHONE)
     */
    private String cellphone;

    /**
     * Thời hạn làm việc (tháng) (AGE_LIMIT)
     */
    private Integer ageLimit;

    /**
     * Địa chỉ làm việc (WORK_ADDRESS)
     */
    private String workAddress;

    /**
     * Phản hồi thâm niên (SENIORITY_RESPONSE)
     */
    private String seniorityResponse;

    /**
     * Ghi chú (REMARK)
     */
    private String remark;

    /**
     * Tên tiếng Anh công ty (CPNY_ENGLISH_NAME)
     */
    private String cpnyEnglishName;

    /**
     * Số điện thoại nhân sự trước (PRO_CPNY_PHONE)
     */
    private String proCpnyPhone;

    /**
     * Có phải nước ngoài không (OVERSEAS)
     */
    private String overseas;

    /**
     * Quốc tịch (NATIONALITY)
     */
    private String nationality;

    /**
     * Tháng bắt đầu (START_MONTH)
     */
    private String startMonth;

    /**
     * Tháng kết thúc (END_MONTH)
     */
    private String endMonth;

    /**
     * Ngày bắt đầu (START_DATE)
     */
    private String startDate;

    /**
     * Ngày kết thúc (END_DATE)
     */
    private String endDate;

    /**
     * Thứ tự hiển thị (ORDERNO)
     */
    private Integer orderNo;

    // Audit fields
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;

    // IP fields
    private String createdIp;
    private String updatedIp;

    private Integer activity;

    // --- Joined Fields from HR_EMPLOYEE ---
    private String empId;
    private String localName;
    private String deptNo;
}
