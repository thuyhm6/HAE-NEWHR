package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsAffirmorSetupDto {

    // ── Thông tin đối tượng đánh giá (EVS_OBJECT) ────────────────────────────
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
    private String listTypeName;
    private String evsGroupName;
    private String evsOccGroup;
    private String evsOccGroupName;
    private String updateDate;
    private String updatedBy;

    // ── Người đánh giá lần 0 (bản thân) ─────────────────────────────────────
    private String localName0;
    private String postGradeName0;

    // ── Người đánh giá lần 1 ─────────────────────────────────────────────────
    private String localName1;
    private String postGradeName1;
    private String personId1;

    // ── Người đánh giá lần 2 ─────────────────────────────────────────────────
    private String localName2;
    private String postGradeName2;
    private String personId2;

    // ── Người đánh giá lần 3 ─────────────────────────────────────────────────
    private String localName3;
    private String postGradeName3;
    private String personId3;

    // ── Người đánh giá lần 4 ─────────────────────────────────────────────────
    private String localName4;
    private String postGradeName4;
    private String personId4;

    // ── Tham số tìm kiếm ────────────────────────────────────────────────────────
    private String dept;            // tìm theo phòng ban (mã hoặc tên) - deprecated
    private String deptNos;         // danh sách mã phòng ban từ DeptTree, phân cách dấu phẩy
    private String affirmorKeyword;  // tìm theo tên người đánh giá
    private String evsType;

    // ── Tham số cho stored procedure addObject ────────────────────────────────
    private String affirmLevel;     // level người đánh giá: 1, 2, 3, 4
    private String personIdAffirm;  // personId của người đánh giá (dùng khi gọi PR_MODIFY_AFFIRM_INFO)
    private String message;         // OUT parameter từ stored procedure
}
