package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.ManageCountInfoEmpDto;
import com.ait.ess.viewDept.dto.ManageCountItemDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ManageCountInfoMapper {

    long countTotal(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByGender(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByEmpType(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByDept(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByPostFamily(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByPostGrade(ManageCountInfoEmpDto params);

    List<ManageCountItemDto> countByAge(ManageCountInfoEmpDto params);

    int countList(ManageCountInfoEmpDto params);

    List<ManageCountInfoEmpDto> selectListPage(ManageCountInfoEmpDto params);
}
