package com.ait.sy.basicMaintenance.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng SY_MENU_PARAM
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyMenuParam {
    private String paramNo;
    private String menuNo;
    private String cpnyId;
    private String isCanBeBuild; // CHAR(1)
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer orderNo;
    private Integer activity;
}
