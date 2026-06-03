package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsConfirmTarget1Dto {

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
    private String mainBusiness;
    private String mainBusinessName;
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

    // Confirm action
    private String evsObjectSeq;
    private String affirmComment;
    private String flag;
    private String message; // OUT param từ stored procedure
    private String affirmLevel;
}
