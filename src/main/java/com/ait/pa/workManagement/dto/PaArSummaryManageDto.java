package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Quản lý tổng hợp chấm công (AR_SUMMARY_MANAGE_HAE) - dùng chung cho điều kiện tìm kiếm,
 * dòng dữ liệu hiển thị và dòng cập nhật giá trị ngoại lệ.
 */
@Data
@NoArgsConstructor
public class PaArSummaryManageDto {

    // Điều kiện tìm kiếm
    private String payScheduleNo;
    private String key;
    private String deptNo;
    private List<String> itemNos;
    private String isSpecialFlag;

    // Dữ liệu AR_SUMMARY_MANAGE_HAE
    private Long arSummaryManageNo;
    private String personId;
    private String itemNo;
    private String itemName;
    private BigDecimal calValue;
    private BigDecimal finalValue;
    private String remark;
    private String updatedBy;
    private String updateDate;

    // Thông tin hiển thị từ HR_EMPLOYEE / PA_PAY_SCHEDULE
    private String empId;
    private String localName;
    private String deptName;
    private String postGrade;
    private String dateStarted;
    private String arStartDate;
}
