package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsAffirmTarget2Dto {

    // Thông tin đối tượng (EVS_OBJECT + EVS_RESUME_INFO)
    private String seq;
    private String evsYear;
    private String resumeSeq;
    private String empid;
    private String localName;
    private String postGradeName;
    private String mainBusiness;
    private String mainBusinessName;
    private String objectType;
    private String objectTypeName;
    private String deptname;
    private String dateStarted;
    private String activity;
    private String activityName;
    private String evsStartDate;
    private String evsEndDate;

    // Thông tin người đánh giá cấp 0 (bản thân), 1 (lần 1), 2 (lần 2)
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

    // Phân trang (DataTables)
    private int draw;
    private int start;
    private int length;

    // Bộ lọc
    private String affirmLevel;
    private String evsType;

    // Lưu tạm thời - dữ liệu từng dòng
    private String evsPoint;
    private String evsGrade;
    private String affirmContent;
    private String flag;
    private String message;

    // Lưu hàng loạt (batch từ màn hình danh sách)
    private List<EvsAffirmTarget2Dto> items;

    // Điểm số từng item EVS_ITEM_SST (dùng trong modal chi tiết)
    private List<EvsItemSstDto> itemScores;
}
