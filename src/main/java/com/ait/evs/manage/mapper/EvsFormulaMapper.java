package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsFormulaDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsFormulaMapper {
    List<EvsFormulaDto> selectList(EvsFormulaDto dto);
    List<EvsFormulaDto> selectFormulaOptions(EvsFormulaDto dto);
    EvsFormulaDto selectOne(@Param("seq") String seq);
    String getNextSeq();
    void insert(EvsFormulaDto dto);
    void update(EvsFormulaDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
