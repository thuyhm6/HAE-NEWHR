package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmTarget1AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsAffirmTarget1AbilityMapper {

    List<EvsItemAbilityDto> selectItemList(EvsAffirmTarget1AbilityDto params);

    void upsertItemScore1(EvsItemAbilityDto dto);

    void upsertAffirm1(EvsAffirmTarget1AbilityDto dto);

    void callModifyObjectActivity(EvsAffirmTarget1AbilityDto dto);
}
