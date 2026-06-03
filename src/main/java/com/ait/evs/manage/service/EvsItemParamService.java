package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsItemParamDto;

import java.util.List;

public interface EvsItemParamService {

    List<EvsItemParamDto> getList(EvsItemParamDto params);

    void saveBatch(List<EvsItemParamDto> list);

    void deleteBatch(List<String> seqs);
}
