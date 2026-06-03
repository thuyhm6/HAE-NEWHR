package com.ait.pa.salary.mapper;

import com.ait.pa.salary.dto.PaInputItemDataDto;
import com.ait.pa.salary.dto.PaParamDataTempDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PaInputItemDataMapper {

    List<PaInputItemDataDto> selectParamItemList(PaInputItemDataDto dto);

    long countParamDataList(PaInputItemDataDto dto);

    List<PaInputItemDataDto> selectParamDataListPage(PaInputItemDataDto dto);

    PaInputItemDataDto selectParamDataOne(@Param("paramDataNo") Long paramDataNo);

    void insertParamData(PaInputItemDataDto dto);

    void updateParamData(PaInputItemDataDto dto);

    void deleteParamData(@Param("paramDataNo") Long paramDataNo);

    // Import Excel -> PA_PARAM_DATA_TEMP
    void deleteParamDataTemp(Map<String, Object> params);

    void insertParamDataTemp(Map<String, Object> params);

    List<PaParamDataTempDto> selectParamDataTempList(PaParamDataTempDto dto);

    void callImportParamDataTemp(Map<String, Object> params);
}
