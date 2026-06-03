package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmTarget2Dto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EvsAffirmTarget2Mapper {

    int countList(EvsAffirmTarget2Dto params);

    List<EvsAffirmTarget2Dto> selectListPage(EvsAffirmTarget2Dto params);

    List<Map<String, Object>> selectGradeSummary(EvsAffirmTarget2Dto params);

    void updateAffirm(EvsAffirmTarget2Dto dto);

    List<String> selectAllObjectSeqs(EvsAffirmTarget2Dto params);

    void callModifyObjectActivity(EvsAffirmTarget2Dto dto);

    EvsPersonalTargetDto selectObjectInfoBySeq(EvsPersonalTargetDto params);

    List<EvsItemSstDto> selectItemListByObjectSeq(EvsItemSstDto params);

    void updateItemScore2(EvsItemSstDto dto);
}
