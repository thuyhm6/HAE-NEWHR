package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsScoreDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsScoreMapper {
    List<EvsScoreDto> selectList(EvsScoreDto dto);
    EvsScoreDto selectOne(@Param("seq") String seq);
    String getNextSeq();
    void insert(EvsScoreDto dto);
    void update(EvsScoreDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
