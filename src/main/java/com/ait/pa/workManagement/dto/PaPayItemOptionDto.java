package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Hạng mục lương được chọn để đối chiếu (PA_ITEM_INPUT IS_USE = 4 - itemValueInfo bản gốc) */
@Data
@NoArgsConstructor
public class PaPayItemOptionDto {

    /** Tên cột PA_SUMMARY_HAE */
    private String itemId;
    private String itemName;
    private String itemType;
}
