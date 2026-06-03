package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsResultEmpDto;

import java.util.List;

public interface EvsResultEmpService {

    List<EvsResultEmpDto> getList(EvsResultEmpDto params);
}
