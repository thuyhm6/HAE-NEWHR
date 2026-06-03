package com.ait.sy.syRole.mapper;

import com.ait.sy.syRole.dto.SyRoleGroupDto;
import com.ait.sy.syRole.model.SyRoleGroup;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface SyRoleGroupMapper {

    List<SyRoleGroupDto> findAll(@Param("keyword") String keyword);

    SyRoleGroup findByRoleGroupId(@Param("roleGroupId") String roleGroupId);

    SyRoleGroup findByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    boolean existsByRoleGroupId(@Param("roleGroupId") String roleGroupId);

    void insert(SyRoleGroup roleGroup);

    void update(SyRoleGroup roleGroup);

    void deleteByRoleGroupId(@Param("roleGroupId") String roleGroupId);

    String getNextGlobalNoSeq();
}
