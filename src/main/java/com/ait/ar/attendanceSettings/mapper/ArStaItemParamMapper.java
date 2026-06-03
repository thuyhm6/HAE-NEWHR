package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArStaItemParamDto;
import com.ait.ar.attendanceSettings.model.ArStaItemParam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface ArStaItemParamMapper {
    List<ArStaItemParamDto> findAll(@Param("searchText") String searchText);

    ArStaItemParam selectByParamNo(@Param("paramNo") String paramNo);

    int insert(ArStaItemParam arStaItemParam);

    int update(ArStaItemParam arStaItemParam);

    int delete(@Param("paramNo") String paramNo);

    String getNextParamNoSeq();

    Integer getMaxCalOrder();

    List<Map<String, Object>> getAvailableItems();
}
