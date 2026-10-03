package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 1 dòng nhân viên (kèm thông tin hạng mục lương nếu có) dùng chung cho các danh sách của nhóm màn
 * Đối chiếu lương. Mỗi câu SQL chỉ trả về các cột cần thiết, cột không có sẽ để null.
 */
@Data
@NoArgsConstructor
public class PaSalaryCheckEmpDto {

    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String teamName;
    private String postFamilyName;
    private String postGradeName;
    private String positionName;
    private String mainBusiness;
    private String empTypeName;
    private String empOfficeName;
    /** DD/MM/YYYY */
    private String dateStarted;
    private String dateLeft;
    private String endProbationDate;
    private BigDecimal realWages;

    /** Quyết định nhân sự (viewVerificationList) */
    private String transDate;
    private String transCodeName;

    /** Hạng mục lương */
    private String itemNo;
    private String itemName;
    private BigDecimal payNumber;
    private String formularValue;
    private String remark;
    private BigDecimal monthPro;
    private BigDecimal monthNow;
    private BigDecimal calValue;

    /** Khoảng chấm công YYYY/MM/DD (thống kê tăng ca) */
    private String arStartDate;
    private String arEndDate;
}
