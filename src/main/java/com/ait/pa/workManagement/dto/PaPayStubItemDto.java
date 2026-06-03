package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaPayStubItemDto {

    private String cpnyId;
    private String personId;
    private Integer itemType;
    private String itemNo;
    private String itemName;
    private Double itemValue;
    private Integer orderNo;
    private String createBy;
    private String createDate;
}
