package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrEducationApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrEducationApplyMapper {

    Long selectEducNextval();

    int insertEducationApply(HrEducationApplyDto dto);

    HrEducationApplyDto selectByApplyNo(@Param("applyNo") String applyNo);
}
