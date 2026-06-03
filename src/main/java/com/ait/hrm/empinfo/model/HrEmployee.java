package com.ait.hrm.empinfo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * HrEmployee Model - Đại diện cho bảng hr_employee trong hệ thống HR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrEmployee {

    /**
     * Mã nhân viên
     */
    private String empId;

    /**
     * Tên tiếng Trung (pinyin)
     */
    private String chinesePinyin;

    /**
     * Tên tiếng Anh
     */
    private String englishName;

    /**
     * Mã vị trí
     */
    private String positionNo;

    /**
     * Mã cấp bậc
     */
    private String postGradeNo;

    /**
     * Ngày bắt đầu làm việc
     */
    private LocalDateTime dateStarted;

    /**
     * Ngày kết thúc thử việc
     */
    private LocalDateTime endProbationDate;

    /**
     * Mã loại nhân viên
     */
    private String empTypeCode;

    /**
     * ID công ty
     */
    private String cpnyId;

    /**
     * ID cá nhân (liên kết với sy_user)
     */
    private String personId;

    /**
     * Mã phòng ban (liên kết với hr_department)
     */
    private String deptNo;

    /**
     * Tên địa phương
     */
    private String localName;

    /**
     * Khu vực làm việc
     */
    private String workArea;

    /**
     * Ngày tạo
     */
    private LocalDateTime createDate;

    /**
     * Người tạo
     */
    private String createdBy;

    /**
     * Ngày cập nhật
     */
    private LocalDateTime updateDate;

    /**
     * Người cập nhật
     */
    private String updatedBy;

    /**
     * Trạng thái hoạt động (1 = hoạt động, 0 = không hoạt động)
     */
    private Integer activity;

    /**
     * Ngành nghề chính
     */
    private String mainBusiness;

    /**
     * Kinh nghiệm
     */
    private String experience;

    /**
     * IP cập nhật
     */
    private String updatedIp;

    /**
     * IP tạo
     */
    private String createdIp;

    /**
     * Tên tiếng Hàn
     */
    private String koreanName;

    /**
     * Mã loại nhân viên chung
     */
    private String empCommonTypeCode;

    /**
     * Vị trí chuẩn
     */
    private String standardPosition;

    /**
     * Mã chức vụ
     */
    private String dutyNo;

    /**
     * Mã bưu điện
     */
    private String postNo;

    /**
     * Mã trạng thái
     */
    private String statusCode;

    /**
     * Ngày rời khỏi
     */
    private LocalDateTime dateLeft;

    /**
     * Số CMND
     */
    private String idCardNo;

    /**
     * Mã ca làm việc
     */
    private String shiftNo;

    /**
     * Văn phòng nhân viên
     */
    private String empOffice;

    /**
     * Tình trạng đương nhiệm
     */
    private String incumbency;

    /**
     * Ngày thăng chức
     */
    private String promotionDay;

    /**
     * Gia đình chức vụ
     */
    private String postFamily;

    /**
     * Xác nhận tuổi nghề
     */
    private String affirmWorkAge;

    /**
     * Loại giờ làm việc
     */
    private String workHourType;

    /**
     * Phân biệt trực tiếp/gián tiếp
     */
    private String directIndirectDistinction;

    /**
     * Loại tuyển dụng
     */
    private String recruitType;

    /**
     * Loại bảo hiểm
     */
    private String insuranceType;

    /**
     * Khu vực bảo hiểm
     */
    private String insuranceArea;

    /**
     * Số hồ sơ
     */
    private String fileNumber;

    /**
     * Sở hữu nhân viên
     */
    private String employeeOwned;

    /**
     * Loại lương
     */
    private String wageType;

    /**
     * Vị trí
     */
    private String position;

    /**
     * Ngày cập nhật cuối
     */
    private String dateLastUp;

    /**
     * Giới thiệu
     */
    private String recommend;

    /**
     * Ngày nhập nhóm
     */
    private LocalDateTime dateGroupEntry;

    /**
     * Ngày hào phong cuối
     */
    private LocalDateTime lastHaofengDate;

    /**
     * Thông tin phân công
     */
    private String assignmentInformation;

    /**
     * Trung tâm chi phí
     */
    private String costCenter;

    /**
     * Số bước lương
     */
    private String payStepNo;

    /**
     * Số thẻ điện thoại
     */
    private String phoneCardNo;

    /**
     * Lý do nghỉ việc
     */
    private String lizhireason;

    /**
     * Phân biệt xã hội
     */
    private String socialDifferentiation;

    /**
     * Có thử việc không
     */
    private String isProbation;

    /**
     * Công ty cung cấp nhân sự
     */
    private String personSupplierCompany;

    /**
     * Giới hạn OT
     */
    private String otLimit;

    /**
     * Giới hạn OT 100
     */
    private String otLimit100;

    /**
     * Người cập nhật giới hạn OT
     */
    private String updatedOtLimitBy;

    /**
     * Ngày cập nhật giới hạn OT
     */
    private LocalDateTime updateOtLimitDate;

    /**
     * Kiểm tra nhân viên có hoạt động không
     */
    public boolean isActive() {
        return this.activity != null || this.activity == 1;
    }

    /**
     * Kiểm tra nhân viên có đang làm việc không
     */
    public boolean isCurrentlyWorking() {
        return dateLeft == null || dateLeft.isAfter(LocalDateTime.now());
    }
}
