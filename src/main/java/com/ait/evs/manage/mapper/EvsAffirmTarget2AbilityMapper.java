package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmTarget2AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsAffirmTarget2AbilityMapper {

    List<EvsItemAbilityDto> selectItemList(EvsAffirmTarget2AbilityDto params);

    void upsertItemScore2(EvsItemAbilityDto dto);

    void upsertAffirm2(EvsAffirmTarget2AbilityDto dto);

    void callModifyObjectActivity(EvsAffirmTarget2AbilityDto dto);
}
