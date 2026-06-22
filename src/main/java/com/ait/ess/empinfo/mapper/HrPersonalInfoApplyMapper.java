package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrPersonalInfoApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrPersonalInfoApplyMapper {

    Long getNextPersonNoSeq();

    int insertPersonalInfoApply(HrPersonalInfoApplyDto dto);

    HrPersonalInfoApplyDto selectByApplyNo(@Param("applyNo") String applyNo);
}
