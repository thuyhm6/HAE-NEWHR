package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrWorkExperienceApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrWorkExperienceApplyMapper {

    Long selectWorkExperNextval();

    int insertWorkExperienceApply(HrWorkExperienceApplyDto dto);

    HrWorkExperienceApplyDto selectByWorkExperNo(@Param("workExperNo") Long workExperNo);
}
