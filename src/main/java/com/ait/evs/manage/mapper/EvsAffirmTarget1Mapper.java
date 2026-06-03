package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmTarget1Dto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EvsAffirmTarget1Mapper {

    int countList(EvsAffirmTarget1Dto params);

    List<EvsAffirmTarget1Dto> selectListPage(EvsAffirmTarget1Dto params);

    List<Map<String, Object>> selectGradeSummary(EvsAffirmTarget1Dto params);

    void updateAffirm(EvsAffirmTarget1Dto dto);

    List<String> selectAllObjectSeqs(EvsAffirmTarget1Dto params);

    void callModifyObjectActivity(EvsAffirmTarget1Dto dto);

    EvsPersonalTargetDto selectObjectInfoBySeq(EvsPersonalTargetDto params);

    List<EvsItemSstDto> selectItemListByObjectSeq(EvsItemSstDto params);

    void updateItemScore1(EvsItemSstDto dto);
}
