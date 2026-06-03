package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.ManageEvsResultEmpDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ManageEvsResultEmpMapper {
    List<ManageEvsResultEmpDto> selectManageEvsResultEmpList(ManageEvsResultEmpDto params);
}
