package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssApplyOtBatchHAEDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssApplyOtBatchHAEMapper {

    int countList(EssApplyOtBatchHAEDto params);

    List<EssApplyOtBatchHAEDto> selectListPage(EssApplyOtBatchHAEDto params);

    List<EssApplyOtBatchHAEDto> selectOtItemList(EssApplyOtBatchHAEDto params);
}
