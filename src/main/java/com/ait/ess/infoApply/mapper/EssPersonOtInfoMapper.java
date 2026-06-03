package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssPersonOtInfoDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssPersonOtInfoMapper {
    List<EssPersonOtInfoDto> selectPersonOtList(EssPersonOtInfoDto dto);
    List<EssPersonOtInfoDto> selectOtItemList(EssPersonOtInfoDto dto);
}
