package com.ait.pa.workManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Hạng mục tổng hợp chấm công có MANAGE_FLAG = 1 (AR_STA_ITEM + AR_STA_ITEM_PARAM). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaArSummaryItemDto {
    private String itemNo;
    private String itemName;
}
