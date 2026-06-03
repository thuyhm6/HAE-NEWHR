package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmTarget2AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;

import java.util.List;

public interface EvsAffirmTarget2AbilityService {

    List<EvsItemAbilityDto> getItemList(EvsAffirmTarget2AbilityDto params);

    void saveDetail(EvsAffirmTarget2AbilityDto dto);

    void confirmDetail(EvsAffirmTarget2AbilityDto dto);

    void rejectDetail(EvsAffirmTarget2AbilityDto dto);
}
