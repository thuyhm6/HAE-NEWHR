package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaPayStubDto {

    // PA_SUMMARY_HTSV fields
    private String payScheduleNo;
    private String payDate;
    private String hrStartDate;
    private String hrEndDate;
    private String arStartDate;
    private String arEndDate;
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postFamilyNo;
    private String postFamily;
    private String positionNo;
    private String positionName;
    private String postGradeNo;
    private String postGrade;
    private String empTypeCode;
    private String empTypeName;
    private String empOffice;
    private String empOfficeName;
    private String accountNo;
    private Integer dependentCount;

    // Từ PA_EMP_ACCOUNT
    private String bankName;
    private String bankAccountNo;
    private String socialInsuranceNo;

    // Search params
    private String empSearch;
    private String deptNos;
    private List<String> deptNoList;
    private String empOfficeCond;

    // Dữ liệu phiếu lương (được populate bởi service)
    private List<PaPayStubItemDto> attendanceItems;  // ITEM_TYPE=1
    private List<PaPayStubItemDto> salaryItems;      // ITEM_TYPE=2
    private List<PaPayStubItemDto> deductionItems;   // ITEM_TYPE=3
    private List<PaPayStubItemDto> standardItems;    // ITEM_TYPE=4
    private List<PaPayStubOtherDto> otherItems;
}
