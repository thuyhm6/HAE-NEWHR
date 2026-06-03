package com.ait.org.orgManage.mapper;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;

import com.ait.org.orgManage.model.OrgBusinessRelation;

import java.util.List;

@Mapper
public interface OrgBusinessRelationMapper {
    List<OrgBusinessRelation> selectByDept(@Param("resumeNo") String resumeNo, @Param("deptNo") String deptNo);

    int insert(OrgBusinessRelation record);

    int update(OrgBusinessRelation record);

    int delete(@Param("seq") String seq);

    OrgBusinessRelation selectBySeq(@Param("seq") String seq);
}
