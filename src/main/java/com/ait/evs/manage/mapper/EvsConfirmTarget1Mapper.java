package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsConfirmTarget1Dto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsConfirmTarget1Mapper {

    int countList(EvsConfirmTarget1Dto params);

    List<EvsConfirmTarget1Dto> selectListPage(EvsConfirmTarget1Dto params);

    EvsPersonalTargetDto selectObjectInfoBySeq(EvsPersonalTargetDto params);

    void callModifyObjectActivity(EvsConfirmTarget1Dto dto);

    void updateAffirmComment(EvsConfirmTarget1Dto dto);
}
