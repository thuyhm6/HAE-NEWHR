package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.ManageEmpPositionInfoDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import org.apache.poi.ss.usermodel.Workbook;

import java.util.List;

public interface ManageEmpPositionInfoService {
    List<ManageEmpPositionInfoDto> getList(ManageEmpPositionInfoDto params);

    List<ManageEmpPositionInsideDto> getInsideExperienceList(String personId);

    Workbook exportExcel(ManageEmpPositionInfoDto params);
}
