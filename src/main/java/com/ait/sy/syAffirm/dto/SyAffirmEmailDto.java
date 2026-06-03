package com.ait.sy.syAffirm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyAffirmEmailDto {
    private String seq;
    private String affirmType;
    private String applyNo;
    private String applyType;
    private String applyPersonId;
    private String affirmPersonId;
    private String title;
    private String affirmLevel;
    private String affirmFlag;
    private String affirmUrl;
    private String activity;
    private String applyTypeCode;
    private String applyPersonInfo;
    private String applyAffirmFlag;
    private String applyFlag;
    private String affirmDate;
    private String readFlag;
    private String emailTitle;
    private String emailContent;
    private String sendFlag;
    private String affirmContent;
    private String lastName;
    private String affirmTypeName;
    private String affirmFlagName;
    private String affirmName;
    private String applyAffirmFlagNo;
    

    // Các trường hệ thống chung
    private String createDate;
    private String createdIp;
    private String createdBy;
    private String updateDate;
    private String updatedIp;
    private String updatedBy;

    // Các trường thông tin người phê duyệt
    private String empId;
    private String localName;
    private String positionNo;
    private String deptName;
    private String positionName;
    private String postionName;
    private String affirmorId;

    // --- Tham số tìm kiếm (chưa duyệt) ---
    private String titleSearch;
    private String applyTypeCodeSearch;
}
