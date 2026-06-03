package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaEmpAccountDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaEmpAccountMapper {

    long countList(PaEmpAccountDto params);

    List<PaEmpAccountDto> selectListPage(PaEmpAccountDto params);

    PaEmpAccountDto selectOne(@Param("paEmpAccountNo") Long paEmpAccountNo);

    int insert(PaEmpAccountDto dto);

    int update(PaEmpAccountDto dto);

    int deleteByNo(@Param("paEmpAccountNo") Long paEmpAccountNo);
}
