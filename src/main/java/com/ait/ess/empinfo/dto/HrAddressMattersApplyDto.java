package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HrAddressMattersApplyDto {

    private Long addressNo;
    private String personId;
    private String addressType;
    private String effectiveStartDate;
    private String addressContent;
    private Integer activity;
    private String nationality;
    private Integer applyType;
    private Long updateAddressNo;
    private String essTypeCode;
    private String callback;
    private String earror;
}
