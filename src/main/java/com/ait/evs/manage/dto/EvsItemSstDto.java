package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsItemSstDto {

    private String seq;
    private String resumeSeq;
    private String evsObjectSeq;
    private String itemName;
    private String itemContent;
    private String itemContentText;
    private String itemScore;
    private String evsScore;
    private String evsScore1;
    private String evsScore2;
    private String affirmScore;
    private String startDate;
    private String endDate;
    private String createDate;
    private String createdBy;
    private String createdIp;
    private String updateDate;
    private String updatedBy;
    private String updatedIp;
    private String activity;

    // flag: 0=Lưu tạm thời, 1=Thực hiện
    private String flag;
    // OUT param từ stored procedure
    private String message;
}
