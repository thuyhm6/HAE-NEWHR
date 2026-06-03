package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaComputeItemParamDto {

    // PA_ITEM_PARAM fields
    private String paramNo;
    private String itemNo;
    private String itemId;
    private String aliasName;
    private Integer calcuOrder;
    private Integer pricision;
    private Double carryBit;
    private String cpnyId;
    private String cpnyName;
    private String applyType;
    private String applyTypeName;
    private Integer showYn;
    private Integer showOrder;
    private String itemFlag;
    private String itemNumber;

    // PA_ITEM fields (for item dropdown)
    private String descr;
    private String datatype;
    private String itemName;

    // Search conditions
    private String aliasNameSearch;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
