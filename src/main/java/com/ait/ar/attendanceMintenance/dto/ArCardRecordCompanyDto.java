package com.ait.ar.attendanceMintenance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dữ liệu quẹt thẻ ra/vào cổng công ty (AR_MAC_RECORDS_COMPANY) - port từ
 * ArCardRecordCtroller#viewArCardRecordCompanyList của dự án cũ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCardRecordCompanyDto {

    private Long recordNo;
    private String cardNo;
    private String localName;
    private String deptName;
    private String postGradeName;
    @JsonProperty("rDate")
    private String rDate;
    @JsonProperty("rTime")
    private String rTime;
    private String doorType;
    private String remark;
    private String insertBy;

    // Fields dùng khi import từ máy chủ Access Control (insertFromDevice)
    private String employeeName;  // EMPLOYEE_NAME (FirstName MiddleName LastName)
    private String swipeDatetime; // R_TIME format yyyy-MM-dd HH:mm:ss
    private String deviceName;    // DEVICENAME

    // Tham số tìm kiếm
    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
