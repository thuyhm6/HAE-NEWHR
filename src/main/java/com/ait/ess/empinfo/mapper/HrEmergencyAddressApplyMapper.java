package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrEmergencyAddressApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrEmergencyAddressApplyMapper {

    Long selectEmergencyNextval();

    int insertEmergencyApply(HrEmergencyAddressApplyDto dto);

    HrEmergencyAddressApplyDto selectByEmergencyNo(@Param("emergencyNo") Long emergencyNo);
}
