package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;

import java.util.List;

public interface EvsPersonalTargetService {

    EvsPersonalTargetDto getObjectInfo(EvsPersonalTargetDto params);

    List<EvsItemSstDto> getItemList(EvsItemSstDto params);

    void saveItem(EvsItemSstDto dto);

    void deleteItem(EvsItemSstDto dto);
}
