package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * Model cho bảng EDU_PLAN_MANAGER (Kế hoạch đào tạo).
 * Port từ /edu/traineducation/planManager (Hanwha_HTSV). Ngày dạng DD/MM/YYYY.
 *
 * Quy ước lưu giảng viên giữ nguyên bản gốc: nếu chọn giảng viên từ danh sách
 * thì TEACHER_NAME = danh sách mã NV (phân cách dấu phẩy) và TEACHER_NAME_EMPID =
 * danh sách tên hiển thị; nếu nhập tay thì TEACHER_NAME = tên nhập tay.
 */
@Data
public class EduPlanManager {

    /** PLAN_NO - khóa chính, sinh trước từ EDU_PLAN_MANA_SEQ (để import lịch học trước khi lưu) */
    @NotBlank(message = "PLAN_NO không được để trống")
    private String planNo;

    /** TRAIN_DIFF_CODE - 4 ký tự đầu của TRAIN_TYPE_NO (giữ nguyên bản gốc) */
    private String trainDiffCode;
    private String trainTypeCode;
    private String trainTypeCodeName;

    /** COURSE_NO - khóa học (EDU_COURSE_MANAGER) được chọn khi thêm mới */
    private String courseNo;
    private String courseNameCode;
    private String courseNumber;

    @NotBlank(message = "PLAN_STARTDATE không được để trống")
    private String planStartdate;
    @NotBlank(message = "PLAN_ENDDATE không được để trống")
    private String planEnddate;

    @NotBlank(message = "CLASS_HOUR không được để trống")
    private String classHour;
    /** CLASS_UNIT: 0 = tháng, 1 = ngày, 2 = giờ */
    private String classUnit;
    private String periodTime;

    private String trainFormCode;
    private String trainFormCodeName;

    /** ISNOT_APPLY: Y/N */
    private String isnotApply;

    /** DES_DEPARTMENT - danh sách mã phòng ban chỉ định, phân cách dấu phẩy */
    private String desDepartment;
    /** DES_EMPLOYEE / DES_EMPLOYEE_NAME - danh sách mã NV / tên NV chỉ định, phân cách dấu phẩy */
    private String desEmployee;
    private String desEmployeeName;

    private String budget;
    /** BUDGET_SHOW: Y/N */
    private String budgetShow;

    private String departManaCode;
    private String departManaCodeName;

    private String teacherName;
    private String teacherNameEmpid;

    /** (Không lưu DB) Tên giảng viên hiển thị trên form. */
    private String teacherDisplay;
    /** (Không lưu DB) Mã NV giảng viên đã chọn từ danh sách, phân cách dấu phẩy. */
    private String teacherEmpid;

    private String trainAddress;
    @NotBlank(message = "TRAIN_PERSON_COUNT không được để trống")
    private String trainPersonCount;
    private String trainPersonRemark;

    /** ISNOT_EVALUATE: "0" hoặc danh sách 1,2,3 (học viên/giảng viên/khóa học) */
    private String isnotEvaluate;

    /** Số dòng lịch học (EDU_TRAIN_SYLLABUS) - chỉ dùng hiển thị */
    private Integer syllabusCount;
}
