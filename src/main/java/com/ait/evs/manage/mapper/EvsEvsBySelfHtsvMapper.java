package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsEvsBySelfHtsvDto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsEvsBySelfHtsvMapper {

    int countList(EvsEvsBySelfHtsvDto params);

    List<EvsEvsBySelfHtsvDto> selectListPage(EvsEvsBySelfHtsvDto params);

    EvsPersonalTargetDto selectObjectInfoBySeq(EvsPersonalTargetDto params);

    void updateEvsScore(EvsItemSstDto dto);

    void upsertAffirm(EvsEvsBySelfHtsvDto dto);

    void callModifyObjectActivity(EvsEvsBySelfHtsvDto dto);
}
