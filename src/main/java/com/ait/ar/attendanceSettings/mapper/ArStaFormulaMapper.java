package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArStaFormulaDto;
import com.ait.ar.attendanceSettings.model.ArStaFormula;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface ArStaFormulaMapper {
    // API để load danh sách bên trái (AR_STA_ITEM_PARAM join SY_GLOBAL_NAME)
    List<Map<String, Object>> getParamItemsForLeftTree(@Param("cpnyId") String cpnyId);

    // API load bảng bên phải theo itemNo
    List<ArStaFormulaDto> findByItemNo(@Param("cpnyId") String cpnyId, @Param("itemNo") String itemNo);

    ArStaFormula selectByFormularNo(@Param("formularNo") Long formularNo);

    int insert(ArStaFormula model);

    int update(ArStaFormula model);

    int delete(@Param("formularNo") Long formularNo);

    Long getNextFormularNoSeq();

    // Các hàm đổ dữ liệu cho phần Công cụ khi Thêm/Sửa công thức
    List<Map<String, Object>> getAttItems();

    List<Map<String, Object>> getStaItems();

    List<Map<String, Object>> getBasicInfos();
}
