package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.ArPersonalListDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalListDto;

import java.util.List;
import java.util.Map;

public interface ArPersonalListService {
    /** Danh sách loại chấm công active (dùng render header cột). */
    List<ArPersonalListDto> getItemList(ArPersonalListDto params);

    /**
     * Tổng hợp chấm công theo từng nhân viên: mỗi row là 1 nhân viên,
     * các cột chấm công được build động từ ITEM_ID trong AR_ITEM.
     */
    List<Map<String, Object>> getSummaryList(ArPersonalListDto params);

    /** Chi tiết từng bản ghi chấm công từ AR_DETAIL_HTSV cho 1 nhân viên + 1 loại. */
    List<ArPersonalListDetailDto> getDetailList(ArPersonalListDetailDto params);
}
