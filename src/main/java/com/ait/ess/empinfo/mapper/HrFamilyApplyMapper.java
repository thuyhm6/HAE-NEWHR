package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrFamilyApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrFamilyApplyMapper {

    Long getNextFamilyNoSeq();

    int insertFamilyApply(HrFamilyApplyDto dto);

    HrFamilyApplyDto selectByApplyNo(@Param("applyNo") String applyNo);
}
