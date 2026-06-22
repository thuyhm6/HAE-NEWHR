package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsEvsBySelfHaeDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EvsEvsBySelfHaeService {

    DataTablesResponse<EvsEvsBySelfHaeDto> getObjectList(EvsEvsBySelfHaeDto params);

    EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq);

    void save(EvsEvsBySelfHaeDto dto);
}
