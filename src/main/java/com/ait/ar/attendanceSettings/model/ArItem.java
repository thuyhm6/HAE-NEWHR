package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArItem {
    private String shortName;
    private String description;
    private String unit;
    private String itemGroupCode;
    private String itemIdMapping;
    private String itemId;
    private String itemNo; // Khóa chính
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private Integer ordernoSst;
}
