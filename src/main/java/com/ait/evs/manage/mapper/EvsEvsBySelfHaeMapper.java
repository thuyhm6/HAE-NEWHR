package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsEvsBySelfHaeDto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsEvsBySelfHaeMapper {

    int countList(EvsEvsBySelfHaeDto params);

    List<EvsEvsBySelfHaeDto> selectListPage(EvsEvsBySelfHaeDto params);

    EvsPersonalTargetDto selectObjectInfoBySeq(EvsPersonalTargetDto params);

    void updateEvsScore(EvsItemSstDto dto);

    void upsertAffirm(EvsEvsBySelfHaeDto dto);

    void callModifyObjectActivity(EvsEvsBySelfHaeDto dto);
}
