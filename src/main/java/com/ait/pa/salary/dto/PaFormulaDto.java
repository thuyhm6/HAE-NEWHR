package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaFormulaDto {

    // PA_FORMULAR fields
    private Long    formularNo;
    private String  itemNo;
    private String  condition;
    private String  formular;
    private Integer conditionSeq;
    private String  description;
    private String  cpnyId;

    // PA_ITEM / SY_GLOBAL_NAME join (left panel)
    private String itemName;

    // Global min/max CONDITION_SEQ trong cùng ITEM_NO (dùng để ẩn mũi tên đầu/cuối)
    private Integer minSeq;
    private Integer maxSeq;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
