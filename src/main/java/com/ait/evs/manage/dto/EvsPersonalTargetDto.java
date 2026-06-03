package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsPersonalTargetDto {

    // Thông tin đối tượng đánh giá (EVS_OBJECT + EVS_RESUME_INFO)
    private String seq;
    private String evsYear;
    private String resumeSeq;
    private String localName;
    private String postGradeName;
    private String mainBusiness;
    private String mainBusinessName;
    private String objectType;
    private String objectTypeName;
    private String deptname;
    private String dateStarted;
    private String activity;
    private String evsStartDate;
    private String evsEndDate;

    // Người đánh giá lần 0, 1, 2
    private String localName0;
    private String localName1;
    private String localName2;
    private String seq0;
    private String seq1;
    private String seq2;
    private String evsPoint0;
    private String evsPoint1;
    private String evsPoint2;
    private String evsGrade0;
    private String evsGrade1;
    private String evsGrade2;
    private String affirmContent0;
    private String affirmContent1;
    private String affirmContent2;
    private String affirmComment1;
    private String affirmComment2;

    // Phần 2: AFFIRM_CONTENT1 (thành tích) và AFFIRM_CONTENT2 (hạn chế) theo từng AFFIRM_LEVEL
    private String affirmC1L0; // AFFIRM_LEVEL=0, AFFIRM_CONTENT1 (thành tích nhân viên)
    private String affirmC2L0; // AFFIRM_LEVEL=0, AFFIRM_CONTENT2 (hạn chế nhân viên)
    private String affirmC1L1; // AFFIRM_LEVEL=1, AFFIRM_CONTENT1 (thành tích cấp 1)
    private String affirmC2L1; // AFFIRM_LEVEL=1, AFFIRM_CONTENT2 (hạn chế cấp 1)
    private String affirmC1L2; // AFFIRM_LEVEL=2, AFFIRM_CONTENT1 (thành tích cấp 2)
    private String affirmC2L2; // AFFIRM_LEVEL=2, AFFIRM_CONTENT2 (hạn chế cấp 2)
}
