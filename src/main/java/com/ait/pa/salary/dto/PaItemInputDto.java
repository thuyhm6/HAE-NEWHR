package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaItemInputDto {

    // PA_ITEM_INPUT fields
    private Long    inputNo;
    private String  itemNo;
    private String  itemName;
    private String  itemId;
    private Integer orderNo;
    private Integer isUse;
    private Integer itemType;
    private Integer activity;
    private String  cpnyId;

    // Mặc định tích chọn / số thứ tự (GET_ITEM_GLAG, GET_ITEM_NUMBER) - chỉ dùng khi hiển thị
    private String  itemFlag;
    private Integer itemNumber;
}
