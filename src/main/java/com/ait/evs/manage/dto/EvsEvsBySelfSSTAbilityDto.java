package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsEvsBySelfSSTAbilityDto {

    // Payload lưu
    private String evsObjectSeq;
    private String resumeSeq;
    private String flag;
    private String message;         // OUT param từ stored procedure
    private String affirmContent;   // SECTION 2: nhận xét bản thân (EVS_AFFIRM.AFFIRM_COMMENT)

    // Danh sách item cần cập nhật điểm tự đánh giá
    private List<EvsItemAbilityDto> items;

    // Fields từ EVS_OBJECT (dùng cho danh sách phân trang nếu cần)
    private String seq;
    private String personId;
    private String localName;
    private String deptname;
    private String postGradeName;
    private String activity;
    private String activityName;
    private String orderno;

    // Phân trang DataTables
    private int draw;
    private int start;
    private int length;

    // Bộ lọc
    private String evsType;
}
