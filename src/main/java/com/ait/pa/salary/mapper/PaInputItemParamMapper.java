package com.ait.pa.salary.mapper;

import com.ait.pa.salary.dto.PaInputItemParamDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaInputItemParamMapper {

    long countList(PaInputItemParamDto params);

    List<PaInputItemParamDto> selectListPage(PaInputItemParamDto params);

    PaInputItemParamDto selectOne(@Param("paramNo") String paramNo);

    void updateOne(PaInputItemParamDto dto);

    void deleteOne(@Param("paramNo") String paramNo);

    List<PaInputItemParamDto> selectDistinctList(PaInputItemParamDto params);
}
