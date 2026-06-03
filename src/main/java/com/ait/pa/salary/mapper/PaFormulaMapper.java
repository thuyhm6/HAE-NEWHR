package com.ait.pa.salary.mapper;

import com.ait.pa.salary.dto.PaFormulaDto;
import com.ait.pa.salary.dto.PaFormulaToolItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaFormulaMapper {

    List<PaFormulaDto> selectItemList(PaFormulaDto dto);

    List<PaFormulaToolItemDto> selectToolParamItemList();

    List<PaFormulaToolItemDto> selectToolSalaryItemList();

    List<PaFormulaToolItemDto> selectToolAttendanceItemList();

    List<PaFormulaToolItemDto> selectToolFixedParamList();

    List<PaFormulaToolItemDto> selectAllItemNames();

    long countFormularList(PaFormulaDto dto);

    List<PaFormulaDto> selectFormularListPage(PaFormulaDto dto);

    PaFormulaDto selectFormularOne(@Param("formularNo") Long formularNo);

    void insertFormular(PaFormulaDto dto);

    void updateFormular(PaFormulaDto dto);

    void deleteFormular(@Param("formularNo") Long formularNo);

    PaFormulaDto findAdjacentBySeq(@Param("itemNo") String itemNo,
                                   @Param("currentSeq") Integer currentSeq,
                                   @Param("direction") String direction);

    void updateConditionSeq(@Param("formularNo") Long formularNo,
                            @Param("conditionSeq") Integer conditionSeq);
}
