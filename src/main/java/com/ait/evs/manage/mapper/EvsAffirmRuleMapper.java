package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmRuleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsAffirmRuleMapper {
    List<EvsAffirmRuleDto> selectList(EvsAffirmRuleDto dto);
    String getNextSeq();
    void insert(EvsAffirmRuleDto dto);
    void update(EvsAffirmRuleDto dto);
    void deleteBySeq(@Param("seq") String seq);
}
