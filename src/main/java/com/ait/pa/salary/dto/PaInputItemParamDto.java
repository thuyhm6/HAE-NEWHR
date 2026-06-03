package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaInputItemParamDto {

    private String paramNo;
    private String id;
    private String distinctField;
    private String distinctField2nd;
    private String paramItemNo;
    private String defaultVal;
    private String paramItemId;
    private String aliasName;
    private String cpnyId;
    private String cpnyName;
    private String distinctFieldName;
    private String distinctField2ndName;
    private Integer itemType;
    private Integer activity;

    // Search conditions
    private Integer itemTypeSearch;
    private String aliasNameSearch;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
