package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsGradeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsGradeMapper {
    List<EvsGradeDto> selectList(EvsGradeDto dto);
    String getNextSeq();
    void insert(EvsGradeDto dto);
    void update(EvsGradeDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
