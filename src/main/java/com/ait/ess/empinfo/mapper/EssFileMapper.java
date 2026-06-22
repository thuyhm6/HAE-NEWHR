package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.EssFileDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EssFileMapper {

    int insertEssFile(EssFileDto dto);

    List<EssFileDto> selectFilesByApplyNo(@Param("applyNo") String applyNo);

    EssFileDto selectByFileNo(@Param("fileNo") String fileNo);
}
