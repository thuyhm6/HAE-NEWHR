package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.ArPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalSelfDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArPersonalSelfMapper {
    List<ArPersonalSelfDto> selectSummaryList(ArPersonalSelfDto params);
    List<ArPersonalSelfDto> selectItemList();
    List<ArPersonalSelfDetailDto> selectDetailList(ArPersonalSelfDetailDto params);
}
