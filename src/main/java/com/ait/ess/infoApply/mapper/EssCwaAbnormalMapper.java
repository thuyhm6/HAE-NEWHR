package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssCwaAbnormalDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssCwaAbnormalMapper {
    List<EssCwaAbnormalDto> selectMyCwaAbnormalList(EssCwaAbnormalDto dto);
}
