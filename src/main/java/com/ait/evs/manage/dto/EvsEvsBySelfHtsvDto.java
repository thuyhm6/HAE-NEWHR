package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsEvsBySelfHtsvDto {

    // Fields from EVS_OBJECT (list)
    private String seq;
    private String resumeSeq;
    private String personId;
    private String empid;
    private String localName;
    private String deptno;
    private String deptname;
    private String postGradeNo;
    private String postGradeName;
    private String objectType;
    private String objectTypeName;
    private String dateStarted;
    private String activity;
    private String activityName;
    private String orderno;

    // Pagination (DataTables)
    private int draw;
    private int start;
    private int length;

    // Filter
    private String evsType;

    // Save action
    private String evsObjectSeq;
    private String flag;
    private String message; // OUT param từ stored procedure

    // Phần 2: Thành tích (AFFIRM_CONTENT1) và Hạn chế (AFFIRM_CONTENT2) - AFFIRM_LEVEL=0
    private String affirmContent1;
    private String affirmContent2;

    // Danh sách items (EVS_ITEM_SST) cần cập nhật EVS_SCORE
    private List<EvsItemSstDto> items;
}
