package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssOtApplyListDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface EssOtApplyMapper {

    Map<String, Object> selectOtDateInfo(@Param("applyDate") String applyDate);

    Map<String, Object> selectOtDuration(
            @Param("applyOtDate") String applyOtDate,
            @Param("otFromTime") String otFromTime,
            @Param("otToTime") String otToTime,
            @Param("deductYn") String deductYn);

    List<EssOtApplyListDto> selectMyOtApplyList(EssOtApplyListDto dto);

    int countLockedOtApply(@Param("applyNos") List<String> applyNos);

    int cancelMyOtApplyList(@Param("applyNos") List<String> applyNos);
}
