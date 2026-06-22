package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrQualificationApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrQualificationApplyMapper {

    Long selectQualNextval();

    int insertQualificationApply(HrQualificationApplyDto dto);

    HrQualificationApplyDto selectByQualNo(@Param("qualNo") Long qualNo);
}
