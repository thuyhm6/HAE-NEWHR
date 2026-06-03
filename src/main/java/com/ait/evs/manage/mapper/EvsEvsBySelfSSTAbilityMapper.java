package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsEvsBySelfSSTAbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsEvsBySelfSSTAbilityMapper {

    List<EvsItemAbilityDto> selectItemList(EvsEvsBySelfSSTAbilityDto params);

    void upsertAffirm(EvsEvsBySelfSSTAbilityDto dto);

    void upsertItemScore(EvsItemAbilityDto dto);

    void callModifyObjectActivity(EvsEvsBySelfSSTAbilityDto dto);
}
