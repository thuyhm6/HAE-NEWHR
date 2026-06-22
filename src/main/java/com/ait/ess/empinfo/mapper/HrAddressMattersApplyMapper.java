package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.HrAddressMattersApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrAddressMattersApplyMapper {

    Long getNextAddressNoSeq();

    int insertAddressApply(HrAddressMattersApplyDto dto);

    HrAddressMattersApplyDto selectByAddressNo(@Param("addressNo") Long addressNo);
}
