package com.ait.pa.salarycode.mapper;

import com.ait.pa.salarycode.dto.PaSalaryCodeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaSalaryCodeMapper {

    List<PaSalaryCodeDto> selectListPage(PaSalaryCodeDto params);

    long countList(PaSalaryCodeDto params);

    PaSalaryCodeDto selectOneParamItem(@Param("itemNo") String itemNo);

    PaSalaryCodeDto selectOneItem(@Param("itemNo") String itemNo);

    String getNextNo();

    void insertParamItem(PaSalaryCodeDto dto);

    void insertItem(PaSalaryCodeDto dto);

    void updateParamItem(PaSalaryCodeDto dto);

    void updateItem(PaSalaryCodeDto dto);

    void deleteParamItem(@Param("itemNo") String itemNo);

    void deleteItem(@Param("itemNo") String itemNo);

    void mergeGlobalNameRow(@Param("no") String no,
                            @Param("language") String language,
                            @Param("content") String content);

    List<String> selectParamItemCompanies(@Param("itemNo") String itemNo);

    List<String> selectItemCompanies(@Param("itemNo") String itemNo);

    void insertParamItemParam(@Param("itemNo") String itemNo, @Param("selectedCpny") String selectedCpny);

    void insertItemParam(@Param("itemNo") String itemNo, @Param("selectedCpny") String selectedCpny);

    void deactivateParamItemParams(@Param("itemNo") String itemNo);

    void deactivateItemParams(@Param("itemNo") String itemNo);
}
