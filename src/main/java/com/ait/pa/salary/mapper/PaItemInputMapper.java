package com.ait.pa.salary.mapper;

import com.ait.pa.salary.dto.PaItemInputDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PaItemInputMapper {

    List<PaItemInputDto> selectHrItems();

    List<PaItemInputDto> selectAttendanceItems();

    List<PaItemInputDto> selectInputItems();

    List<PaItemInputDto> selectComputeItems();

    List<PaItemInputDto> selectSavedItems(@Param("isUse") Integer isUse,
                                          @Param("itemType") Integer itemType);

    void insertItem(PaItemInputDto dto);

    void deleteByIsUseAndItemType(@Param("isUse") Integer isUse,
                                  @Param("itemType") Integer itemType);

    List<PaItemInputDto> selectItemNamesByIds(@Param("itemIds") List<String> itemIds);

    List<Map<String, Object>> selectSummaryHtsvData(@Param("payScheduleNo") String payScheduleNo,
                                                    @Param("deptNos") List<String> deptNos);
}
