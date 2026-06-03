package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArStaItemDto;
import com.ait.ar.attendanceSettings.model.ArStaItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArStaItemMapper {
    List<ArStaItemDto> findAll(@Param("searchText") String searchText);

    ArStaItem selectByItemNo(@Param("itemNo") String itemNo);

    int insert(ArStaItem arStaItem);

    int update(ArStaItem arStaItem);

    int delete(@Param("itemNo") String itemNo);
}
