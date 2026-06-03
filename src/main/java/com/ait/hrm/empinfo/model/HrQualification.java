package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HrQualification Model - Thông tin chứng chỉ (bảng HR_QUALIFICATION)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrQualification {

    /**
     * Mã số chứng chỉ (QUAL_NO)
     */
    private Long qualNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Tên chứng chỉ (QUAL_NAME)
     */
    private String qualName;

    /**
     * Ngày nhận (DATE_OBTAINED)
     */
    private LocalDate dateObtained;

    /**
     * Số chứng chỉ (QUAL_CARD_NO)
     */
    private String qualCardNo;

    /**
     * Nơi cấp (QUAL_INSTITUTE)
     */
    private String qualInstitute;

    /**
     * Ngày hết hạn (VALIDITY_DATE)
     */
    private LocalDate validityDate;

    /**
     * Hình thức đạt được (ACQUISITION_MODES)
     */
    private String acquisitionModes;

    /**
     * Cấp độ chứng chỉ (QUAL_LEVEL)
     */
    private String qualLevel;

    /**
     * Có được trả phụ cấp hay không (PAYMENTALLOWANCE_Y_N)
     */
    private String paymentAllowanceYN;

    /**
     * Ghi chú (QUAL_REMARK)
     */
    private String qualRemark;

    /**
     * Xếp loại (QUAL_GRADE)
     */
    private String qualGrade;

    /**
     * Ngày nộp chứng chỉ (QUAL_SUBMIT_DATE)
     */
    private String qualSubmitDate;

    /**
     * Mã tên chứng chỉ (QUAL_NAME_CODE)
     */
    private String qualNameCode;

    /**
     * Mã xếp loại (QUAL_GRADE_CODE)
     */
    private String qualGradeCode;

    /**
     * Tên file đính kèm (FILE_NAME)
     */
    private String fileName;

    /**
     * Url file đính kèm (FILE_URL)
     */
    private String fileUrl;

    /**
     * Thứ tự hiển thị (ORDERNO)
     */
    private Integer orderNo;

    /**
     * Trạng thái hoạt động (ACTIVITY)
     */
    private Integer activity;

    // Audit fields
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;

    // IP fields
    private String createdIp;
    private String updatedIp;

    // --- Joined Fields from HR_EMPLOYEE ---
    /**
     * Mã nhân viên (EMP_ID)
     */
    private String empId;
    /**
     * Tên nhân viên (LOCAL_NAME)
     */
    private String localName;
    private String deptName;
}
