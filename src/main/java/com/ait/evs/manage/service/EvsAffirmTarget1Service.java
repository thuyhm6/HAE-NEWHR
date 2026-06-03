package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmTarget1Dto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface EvsAffirmTarget1Service {

    DataTablesResponse<EvsAffirmTarget1Dto> getObjectList(EvsAffirmTarget1Dto params);

    List<Map<String, Object>> getGradeSummary(EvsAffirmTarget1Dto params);

    void saveBatch(EvsAffirmTarget1Dto dto);

    void executeActivity(EvsAffirmTarget1Dto dto);

    EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq);

    List<EvsItemSstDto> getItemList(String evsObjectSeq);

    void saveDetail(EvsAffirmTarget1Dto dto);

    void confirmDetail(EvsAffirmTarget1Dto dto);

    void rejectDetail(EvsAffirmTarget1Dto dto);
}
