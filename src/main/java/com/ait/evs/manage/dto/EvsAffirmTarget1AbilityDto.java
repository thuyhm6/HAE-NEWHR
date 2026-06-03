package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsAffirmTarget1AbilityDto {

    private String seq;           // EVS_OBJECT.SEQ
    private String resumeSeq;
    private String affirmContent;
    private String evsPoint;
    private String evsGrade;
    private String flag;
    private String message;       // OUT param từ stored procedure

    // Danh sách điểm từng hạng mục năng lực
    private List<EvsItemAbilityDto> items;
}
