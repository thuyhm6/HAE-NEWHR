package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmTarget1AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;

import java.util.List;

public interface EvsAffirmTarget1AbilityService {

    List<EvsItemAbilityDto> getItemList(EvsAffirmTarget1AbilityDto params);

    void saveDetail(EvsAffirmTarget1AbilityDto dto);

    void confirmDetail(EvsAffirmTarget1AbilityDto dto);

    void rejectDetail(EvsAffirmTarget1AbilityDto dto);
}
