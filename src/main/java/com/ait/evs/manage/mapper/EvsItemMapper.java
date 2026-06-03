package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsItemDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsItemMapper {

    List<EvsItemDto> selectList(EvsItemDto dto);

    String getNextSeq();

    void insert(EvsItemDto dto);

    void update(EvsItemDto dto);

    void deleteBySeq(String seq);
}
