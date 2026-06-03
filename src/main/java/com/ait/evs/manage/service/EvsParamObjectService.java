package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsParamObjectDto;

import java.util.List;

public interface EvsParamObjectService {
    List<EvsParamObjectDto> getList(EvsParamObjectDto params);
    void saveBatch(List<EvsParamObjectDto> list);
    void deleteBatch(List<String> seqs);
}
