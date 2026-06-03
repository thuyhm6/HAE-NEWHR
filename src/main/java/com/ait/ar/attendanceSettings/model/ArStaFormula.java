package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArStaFormula {
    private Long formularNo;
    private String itemNo;
    private String condition;
    private String formular; // Tên chuẩn trong DB là FORMULAR (mặc dù đúng chính tả là formula)
    private String cpnyId;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
}
