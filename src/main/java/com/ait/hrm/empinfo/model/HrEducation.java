package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * HrEducation Model - Thông tin quá trình học tập (bảng HR_EDUCATION)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrEducation {

    /**
     * Mã số quá trình học tập (EDUC_NO)
     */
    private Long educNo;

    /**
     * ID cá nhân (PERSON_ID)
     */
    private String personId;

    /**
     * Mã bằng cấp (DEGREE_CODE)
     */
    private String degreeCode;

    /**
     * Tên bằng cấp (DEGREE_NAME) - Lấy từ bảng HR_CODE_DETAIL dựa vào DEGREE_CODE
     */
    private String degreeName;

    /**
     * Là bằng cấp cao nhất (FINAL_DEGREE_WHETHER) - Y/N
     */
    private String finalDegreeWhether;

    /**
     * Mã học vị (DEGREES_CODE)
     */
    private String degreesCode;

    /**
     * Tên trường/Cơ sở đào tạo (INSTITUTION_NAME)
     */
    private String institutionName;

    /**
     * Chuyên ngành (SUBJECT)
     */
    private String subject;

    /**
     * Ngày bắt đầu (START_DATE)
     */
    private String startDate;

    /**
     * Ngày kết thúc (END_DATE)
     */
    private String endDate;

    /**
     * Thời gian học (SCHOOL_LENGTH)
     */
    private String schoolLength;

    /**
     * Tên luận văn (THESIS_NAME_LOCAL)
     */
    private String thesisNameLocal;

    /**
     * Tên luận văn tiếng Anh (THESIS_NAME_ENG)
     */
    private String thesisNameEng;

    /**
     * Chuyên ngành 2 (SUBJECT_SECOND)
     */
    private String subjectSecond;

    /**
     * Số bằng cấp (EDU_DEG_NUM)
     */
    private String eduDegNum;

    /**
     * Quốc gia (SITE_COUNTRY)
     */
    private String siteCountry;

    /**
     * Ghi chú (REMARK)
     */
    private String remark;

    /**
     * Tên quốc gia (SITE_COUNTRY_NAME)
     */
    private String siteCountryName;

    /**
     * Thứ tự hiển thị (ORDERNO)
     */
    private Integer orderNo;

    /**
     * Trạng thái hoạt động (ACTIVITY)
     */
    private Integer activity;

    /**
     * Địa điểm (PLACE)
     */
    private String place;

    /**
     * Có du học không (STUDY_EXPERIENCE) - Y/N
     */
    private String studyExperience;

    /**
     * Tên file đính kèm (FILE_NAME)
     */
    private String fileName;

    /**
     * Đường dẫn file đính kèm (FILE_URL)
     */
    private String fileUrl;

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
    private String deptName; // Nếu cần hiển thị bộ phận
}
