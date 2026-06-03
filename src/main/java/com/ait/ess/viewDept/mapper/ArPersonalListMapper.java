package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.ArPersonalListDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalListDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArPersonalListMapper {
    /** Lấy danh sách ITEM_ID active từ AR_ITEM (dùng làm tên cột động). */
    List<ArPersonalListDto> selectItemList(ArPersonalListDto params);

    /** Lấy danh sách ITEM_ID thuần để build câu SQL động (có thể lọc theo itemGroup). */
    List<String> selectActiveItemIds(ArPersonalListDto params);

    /**
     * Tổng hợp chấm công: mỗi hàng = 1 nhân viên.
     * Cột động được build từ params.itemIds (tên cột = ITEM_ID trong AR_EMP_DAY_TOTAL).
     */
    List<Map<String, Object>> selectSummaryList(ArPersonalListDto params);

    /** Chi tiết từng bản ghi chấm công của 1 nhân viên + 1 loại trong AR_DETAIL_HTSV. */
    List<ArPersonalListDetailDto> selectDetailList(ArPersonalListDetailDto params);
}
