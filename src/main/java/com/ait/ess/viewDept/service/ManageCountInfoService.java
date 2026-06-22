package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.ManageCountInfoEmpDto;
import com.ait.ess.viewDept.dto.ManageCountInfoSummaryDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface ManageCountInfoService {

    ManageCountInfoSummaryDto getSummary(ManageCountInfoEmpDto params);

    DataTablesResponse<ManageCountInfoEmpDto> getPageList(ManageCountInfoEmpDto params);
}
