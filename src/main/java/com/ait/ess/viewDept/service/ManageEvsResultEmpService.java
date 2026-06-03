package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.ManageEvsResultEmpDto;

import java.util.List;

public interface ManageEvsResultEmpService {
    List<ManageEvsResultEmpDto> getList(ManageEvsResultEmpDto params);
}
