package com.ait.org.orgManage.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * HrDepartment Model - Đại diện cho bảng hr_department trong hệ thống HR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrDepartment {

    /**
     * ID phòng ban
     */
    private String deptId;

    /**
     * ID công ty
     */
    private String cpnyId;

    /**
     * Ngày tạo
     */
    private LocalDateTime dateCreated;

    /**
     * Ngày kết thúc
     */
    private LocalDateTime dateEnded;

    /**
     * Cấp phòng ban
     */
    private Integer deptLevel;

    /**
     * ID nhân viên quản lý
     */
    private String managerEmpId;

    /**
     * Mã phòng ban (liên kết với hr_employee)
     */
    private String deptNo;

    /**
     * Mã phòng ban cha
     */
    private String parentDeptNo;

    /**
     * Khu vực làm việc
     */
    private String workArea;

    /**
     * Loại phòng ban
     */
    private String deptType;

    /**
     * Tên tổ chức tiếng Anh
     */
    private String orgNameEng;

    /**
     * Tên tổ chức địa phương
     */
    private String orgNameLocal;

    /**
     * Cấp tổ chức
     */
    private String orgLevel;

    /**
     * Trung tâm chi phí
     */
    private String costCenter;

    /**
     * Sử dụng hay không
     */
    private String useYn;

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
     * Thứ tự sắp xếp
     */
    private Integer orderNo;

    /**
     * Trạng thái hoạt động (1 = hoạt động, 0 = không hoạt động)
     */
    private Integer activity;

    /**
     * Có phải phòng ban không
     */
    private String isDept;

    /**
     * Có phải bán thời gian không
     */
    private String isPartTime;

    /**
     * Loại sản phẩm
     */
    private String productType;

    /**
     * IP tạo
     */
    private String createdIp;

    /**
     * IP cập nhật
     */
    private String updatedIp;

    /**
     * Số hồ sơ
     */
    private String resumeNo;

    /**
     * Ghi chú
     */
    private String remark;

    /**
     * Tiêu chuẩn phí
     */
    private String feeStandard;

    /**
     * Tiêu chuẩn phân biệt phòng ban
     */
    private String deptDistinguishStandard;

    /**
     * ID nhân viên quản lý dự phòng
     */
    private String prepManagerEmpId;

    /**
     * Thứ tự sắp xếp
     */
    private String orderNoStr;

    /**
     * Tên tổ chức tiếng Hàn
     */
    private String orgNameKo;

    /**
     * Tên tổ chức tiếng Việt
     */
    private String orgNameVi;

    /**
     * Tên trung tâm chi phí (Virtual)
     */
    private String costCenterName;

    /**
     * Tên trưởng phòng (Virtual)
     */
    private String managerEmpName;

    /**
     * Kiểm tra phòng ban có hoạt động không
     */
    public boolean isActive() {
        return this.activity != null || this.activity == 1;
    }

    /**
     * Kiểm tra phòng ban có đang sử dụng không
     */
    public boolean isInUse() {
        return "Y".equals(this.useYn) || "1".equals(this.useYn);
    }

    /**
     * Kiểm tra phòng ban có còn hiệu lực không
     */
    public boolean isCurrentlyValid() {
        if (dateEnded == null) {
            return true; // Không có ngày kết thúc
        }
        return dateEnded.isAfter(LocalDateTime.now());
    }
}
