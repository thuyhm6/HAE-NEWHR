package com.ait.ess.infoApplyLeave.mapper;

import com.ait.ess.infoApplyLeave.dto.EssCardApplyListDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EssCardApplyListMapper {
    List<EssCardApplyListDto> selectMyCardApplyList(EssCardApplyListDto dto);
    int cancelMyCardApplyList(@Param("applyNos") List<String> applyNos);
    int countLockedByArDetail(@Param("applyNos") List<String> applyNos);
    int countLockedByDeptManage(@Param("applyNos") List<String> applyNos);
}
