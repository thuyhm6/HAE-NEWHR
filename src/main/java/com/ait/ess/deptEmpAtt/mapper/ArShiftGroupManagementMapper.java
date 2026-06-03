package com.ait.ess.deptEmpAtt.mapper;

import com.ait.ess.deptEmpAtt.dto.ArShiftGroupManagementDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArShiftGroupManagementMapper {

    // Lấy danh sách lịch sử thay đổi ca (JOIN HR_EMPLOYEE)
    List<ArShiftGroupManagementDto> selectList(ArShiftGroupManagementDto dto);

    // ESS: Lấy lịch sử nhóm ca của chính user (theo personId)
    List<ArShiftGroupManagementDto> selectByPersonId(ArShiftGroupManagementDto dto);

    // Gọi Procedure AR_SHIFTGROUP_CHANGE_P
    void callChangeProcedure(Map<String, Object> params);
}
