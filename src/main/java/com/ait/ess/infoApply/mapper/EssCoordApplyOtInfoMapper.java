package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssCoordApplyOtInfoDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssCoordApplyOtInfoMapper {

    int countList(EssCoordApplyOtInfoDto params);

    List<EssCoordApplyOtInfoDto> selectListPage(EssCoordApplyOtInfoDto params);

    List<EssCoordApplyOtInfoDto> selectOtItemList(EssCoordApplyOtInfoDto params);
}
