package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsAffirmTarget2Dto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface EvsAffirmTarget2Service {

    DataTablesResponse<EvsAffirmTarget2Dto> getObjectList(EvsAffirmTarget2Dto params);

    List<Map<String, Object>> getGradeSummary(EvsAffirmTarget2Dto params);

    void saveBatch(EvsAffirmTarget2Dto dto);

    void executeActivity(EvsAffirmTarget2Dto dto);

    EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq);

    List<EvsItemSstDto> getItemList(String evsObjectSeq);

    void saveDetail(EvsAffirmTarget2Dto dto);

    void confirmDetail(EvsAffirmTarget2Dto dto);

    void rejectDetail(EvsAffirmTarget2Dto dto);
}
