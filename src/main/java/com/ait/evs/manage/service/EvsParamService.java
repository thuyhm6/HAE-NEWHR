package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsParamDto;

import java.util.List;

public interface EvsParamService {
    List<EvsParamDto> getList(EvsParamDto params);
    List<EvsParamDto> getGroupOptions(String resumeSeq);
    void saveBatch(List<EvsParamDto> list);
    void deleteBatch(List<String> seqs);
}
