package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsConfirmTarget1Dto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EvsConfirmTarget1Service {

    DataTablesResponse<EvsConfirmTarget1Dto> getObjectList(EvsConfirmTarget1Dto params);

    EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq);

    void confirm(EvsConfirmTarget1Dto dto);
}
