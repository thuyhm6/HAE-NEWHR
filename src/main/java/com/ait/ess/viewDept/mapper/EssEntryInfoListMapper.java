package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.EssEntryInfoListDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssEntryInfoListMapper {

    int countList(EssEntryInfoListDto dto);

    List<EssEntryInfoListDto> selectListPage(EssEntryInfoListDto dto);
}
