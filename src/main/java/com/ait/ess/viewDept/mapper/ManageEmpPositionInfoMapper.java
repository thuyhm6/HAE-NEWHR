package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.ManageEmpPositionInfoDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ManageEmpPositionInfoMapper {
    List<ManageEmpPositionInfoDto> selectManageEmpPositionInfoList(ManageEmpPositionInfoDto params);

    List<ManageEmpPositionInsideDto> selectInsideExperienceList(@Param("personId") String personId);
}
