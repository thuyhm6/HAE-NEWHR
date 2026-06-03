package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsItemDto;

import java.util.List;

public interface EvsItemService {

    List<EvsItemDto> getList(EvsItemDto params);

    void saveBatch(List<EvsItemDto> list);

    void deleteBatch(List<String> seqs);
}
