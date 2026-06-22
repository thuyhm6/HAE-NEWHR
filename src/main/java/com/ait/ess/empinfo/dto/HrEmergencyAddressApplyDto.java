package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HrEmergencyAddressApplyDto {

    private Long emergencyNo;
    private String personId;
    private String emerName;
    private String emerPhone;
    private String emerPhoneSecond;
    private String emerEmail;
    private String mainLiaisonOffice;
    private String emerAddress;
    private String emerTypeCode;
    private Integer activity;
    private String mobilePhone;
    private String nationality;
    private Integer applyType;
    private Long updateEmergencyNo;
    private String essTypeCode;
    private String emerCellphone;
    private String emerWorkPhone;
    private String isEmergencyAddress;
    private String earror;
    private String callback;
}
