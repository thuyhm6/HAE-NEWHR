package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArPersonalListDto {
    // Dùng cho items API (header cột)
    private String itemId;
    private String itemName;

    // Filter params cho summary API
    private String keyword;
    private String deptNos;
    private String empTypeCode;
    private String startDate;
    private String endDate;
    private String itemGroup;  // để backend lọc AR_ITEM theo nhóm nghỉ phép này, tránh phải load tất cả AR_ITEM (ACTIVITY=1)

    // Danh sách ITEM_ID active (lấy từ AR_ITEM, truyền vào mapper để build SELECT động)
    private List<String> itemIds;
}
