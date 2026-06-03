package com.ait.org.orgManage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.org.orgManage.model.OrgCostCenter;

import java.util.List;

@Mapper
public interface OrgCostCenterMapper {
    List<OrgCostCenter> selectList(@Param("codeNo") String codeNo, @Param("codeName") String codeName);

    int insert(OrgCostCenter record);

    int update(OrgCostCenter record);

    int delete(@Param("seq") String seq);

    OrgCostCenter selectBySeq(@Param("seq") String seq);
}
