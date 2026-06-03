package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EvsPersonalTargetMapper {

    EvsPersonalTargetDto selectObjectInfo(EvsPersonalTargetDto params);

    List<EvsItemSstDto> selectItemList(EvsItemSstDto params);

    String getNextItemSeq();

    void insertItem(EvsItemSstDto dto);

    void updateItem(EvsItemSstDto dto);

    void deleteItem(EvsItemSstDto dto);

    void callModifyObjectActivity(EvsItemSstDto dto);
}
