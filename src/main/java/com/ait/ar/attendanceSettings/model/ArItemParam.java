package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArItemParam {
    private String arParamNo; // Khóa chính
    private String groupNo;
    private Double unitValue;
    private Double minValue;
    private Double maxValue;
    private String dependItem;
    private String replaceItem;
    private Integer cardFlag;
    private Integer cardFromFlag;
    private Double cardFromOffset;
    private String cardFromRelation;
    private Integer cardToFlag;
    private Double cardToOffset;
    private String cardToRelation;
    private Integer applyFlag;
    private String applyType;
    private Double applyFulldayValue;
    private Integer applyCardPriority;
    private String dateType;
    private String cpnyId;
    private String itemNo;
    private String unit;
    private String detailContent;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer orderno;
    private Integer activity;
}
