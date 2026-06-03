package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsResumeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface EvsResumeMapper {
    List<EvsResumeDto> selectList(EvsResumeDto dto);
    EvsResumeDto selectOne(@Param("seq") String seq);
    String getNextSeq();
    void insert(EvsResumeDto dto);
    void update(EvsResumeDto dto);
    void delete(@Param("seq") String seq);
    List<EvsResumeDto> selectEvsResumeList(EvsResumeDto params);
    void callInitEvsParam(Map<String, Object> params);
}
