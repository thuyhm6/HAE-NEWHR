package com.ait.pa.salary.mapper;

import com.ait.pa.salary.dto.PaComputeItemParamDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaComputeItemParamMapper {

    long countList(PaComputeItemParamDto params);

    List<PaComputeItemParamDto> selectListPage(PaComputeItemParamDto params);

    PaComputeItemParamDto selectOne(@Param("paramNo") String paramNo);

    void insertOne(PaComputeItemParamDto dto);

    void updateOne(PaComputeItemParamDto dto);

    void deleteOne(@Param("paramNo") String paramNo);

    List<PaComputeItemParamDto> selectItemList(PaComputeItemParamDto params);

    List<PaComputeItemParamDto> selectApplyTypeList(PaComputeItemParamDto params);

    PaComputeItemParamDto findAdjacentByOrder(@Param("currentOrder") Integer currentOrder,
                                              @Param("direction") String direction);

    void updateCalcuOrder(@Param("paramNo") String paramNo,
                          @Param("calcuOrder") Integer calcuOrder);
}
