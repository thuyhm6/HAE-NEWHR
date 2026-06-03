package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsEvsBySelfSSTAbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;

import java.util.List;

public interface EvsEvsBySelfSSTAbilityService {

    List<EvsItemAbilityDto> getItemList(EvsEvsBySelfSSTAbilityDto params);

    void save(EvsEvsBySelfSSTAbilityDto dto);
}
