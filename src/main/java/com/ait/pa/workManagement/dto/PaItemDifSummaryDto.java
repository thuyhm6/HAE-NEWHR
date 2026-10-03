package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Tổng hợp chênh lệch theo hạng mục + loại thay đổi (viewResultConfirmSonList3 bản gốc) */
@Data
@NoArgsConstructor
public class PaItemDifSummaryDto {

    private String itemId;
    private String itemNo;
    private String itemName;
    private String itemType;
    /** 0 đối tượng mới, 1 hạng mục thêm mới, 2 hạng mục ngoại lệ, 3 không đổi, 4 thay đổi số tiền */
    private String monthDif;
    private Integer personNum;
    private BigDecimal monthPro;
    private BigDecimal monthNow;
}
