package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmRuleDto;

import java.util.List;

public interface EvsAffirmRuleService {
    List<EvsAffirmRuleDto> getList(EvsAffirmRuleDto params);
    void saveBatch(List<EvsAffirmRuleDto> list);
    void deleteBatch(List<String> seqs);
}
