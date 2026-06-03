package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsResultDto {

    // ── EVS_OBJECT ────────────────────────────────────────────────────────────
    private String seq;
    private String resumeSeq;
    private String personId;
    private String empid;
    private String localName;
    private String deptno;
    private String deptname;
    private String postGradeNo;
    private String postGradeName;
    private String mainBusiness;
    private String mainBusinessName;
    private String objectType;
    private String objectTypeName;
    private String dateStarted;
    private String activity;
    private String activityName;
    private String finalGrade;
    private String finalGradeOr;
    private String finalAffirmContent;
    private String updateDate;
    private String updatedBy;
    private String orderno;

    // ── Trạng thái đánh giá (AFFIRM_FLAG) theo từng lần ─────────────────────
    private String affirmFlagName0;
    private String affirmFlagName1;
    private String affirmFlagName2;
    private String affirmFlagName3;
    private String affirmFlagName4;

    // ── Tên người đánh giá (LOCAL_NAME) theo từng lần ────────────────────────
    private String localName0;
    private String localName1;
    private String localName2;
    private String localName3;
    private String localName4;

    // ── Chức vụ người đánh giá (POST_GRADE_NAME) theo từng lần ───────────────
    private String postGradeName0;
    private String postGradeName1;
    private String postGradeName2;
    private String postGradeName3;
    private String postGradeName4;

    // ── SEQ của bản ghi đánh giá (EVS_AFFIRM.SEQ) theo từng lần ─────────────
    private String seq0;
    private String seq1;
    private String seq2;
    private String seq3;
    private String seq4;

    // ── Điểm đánh giá (EVS_POINT) theo từng lần ─────────────────────────────
    private String evsPoint0;
    private String evsPoint1;
    private String evsPoint2;
    private String evsPoint3;
    private String evsPoint4;

    // ── Cấp đánh giá (EVS_GRADE) theo từng lần ───────────────────────────────
    private String evsGrade0;
    private String evsGrade1;
    private String evsGrade2;
    private String evsGrade3;
    private String evsGrade4;

    // ── Nội dung xác nhận (AFFIRM_CONTENT) theo từng lần ─────────────────────
    private String affirmContent0;
    private String affirmContent1;
    private String affirmContent2;
    private String affirmContent3;
    private String affirmContent4;

    // ── Tham số tìm kiếm ─────────────────────────────────────────────────────
    private String deptNos;
    private String empSearch;
    private String statusFilter;
    private String evsType;

    // ── Tham số cho thao tác hàng loạt ───────────────────────────────────────
    private List<String> seqList;
    private String status;
    private String message;
}
