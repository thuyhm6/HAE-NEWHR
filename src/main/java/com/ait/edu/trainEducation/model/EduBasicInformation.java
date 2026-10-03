package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.util.List;

/**
 * Model cho bảng EDU_BASIC_INFORMATION (Thông tin đào tạo cơ bản - khóa đào tạo thực hiện).
 * Port từ /edu/traineducation/trainBasicInformation (Hanwha_HTSV). Ngày dạng DD/MM/YYYY.
 * Các cột *_EMPID / *_NAME lưu danh sách phân cách dấu phẩy như bản gốc.
 */
@Data
public class EduBasicInformation {

    /** BASIC_NO - khóa chính, sinh từ EDU_BASIC_INFOR_SEQ */
    private String basicNo;
    /** PLAN_NO - Kế hoạch đào tạo (EDU_PLAN_MANAGER) */
    private String planNo;

    private String trainTypeCode;
    private String trainTypeCodeName;
    private String courseNameCode;
    private String trainFormCode;
    private String trainFormCodeName;
    private String trainAddress;
    private String impleStartDate;
    private String impleEndDate;
    private String impleClassHour;
    /** IMPLE_CLASS_UNIT: 0 = tháng, 1 = ngày, 2 = giờ */
    private String impleClassUnit;
    private String trainContent;
    private String desDepartment;
    private String periodTime;
    private String applyEndDate;

    /** Giảng viên (theo kế hoạch) */
    private String comTeacherEmpid;
    private String comTeacherName;
    /** Giảng viên đánh giá học viên */
    private String evaTeacherEmpid;
    private String evaTeacherName;
    /** Đối tượng đào tạo theo kế hoạch (NV chỉ định của kế hoạch) */
    private String planEmployeeEmpid;
    private String planEmployeeName;

    // ===== Không lưu trực tiếp vào EDU_BASIC_INFORMATION =====
    /** NV chỉ định thực tế (EDU_FREE_EMPLOYEE.FLAG = 1) */
    private List<EduPerson> actEmployees;
    /** NV tự chọn (EDU_FREE_EMPLOYEE.FLAG = 2) */
    private List<EduPerson> freeEmployees;
    /** NV đăng ký đã được duyệt (EDU_FREE_EMPLOYEE.FLAG = 3) - chỉ hiển thị */
    private List<EduPerson> applyEmployees;
    /** Nhân viên thực tế (EDU_FINAL_STUDENT) */
    private List<EduPerson> finalStudents;
}
