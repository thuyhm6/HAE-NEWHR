package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsEvsBySelfHtsvDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EvsEvsBySelfHtsvService {

    DataTablesResponse<EvsEvsBySelfHtsvDto> getObjectList(EvsEvsBySelfHtsvDto params);

    EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq);

    void save(EvsEvsBySelfHtsvDto dto);
}
