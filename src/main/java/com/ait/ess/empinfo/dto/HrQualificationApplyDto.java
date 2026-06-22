package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HrQualificationApplyDto {

    private Long qualNo;
    private String personId;
    private String qualName;
    private String dateObtained;
    private String qualCardNo;
    private String qualInstitute;
    private Long orderno;
    private Integer activity;
    private String validityDate;
    private String acquisitionModes;
    private String qualLevel;
    private String paymentallowanceYN;
    private String qualGrade;
    private String qualRemark;
    private Long updateQualNo;
    private Integer applyType;
    private String essTypeCode;
    private String fileUrl;
    private String fileName;
    private String filenosstr;
    private String earror;
    private String callback;
}
