package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OtApplyPersonalSelfMapper {
    List<OtApplyPersonalSelfDto> selectSummaryList(OtApplyPersonalSelfDto params);
    List<OtApplyPersonalSelfDto> selectItemList();
    List<OtApplyPersonalSelfDetailDto> selectDetailList(OtApplyPersonalSelfDetailDto params);
}
