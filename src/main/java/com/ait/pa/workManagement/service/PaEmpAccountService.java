package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaEmpAccountDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface PaEmpAccountService {

    DataTablesResponse<PaEmpAccountDto> getPagedList(PaEmpAccountDto params);

    PaEmpAccountDto getOne(Long paEmpAccountNo);

    void save(PaEmpAccountDto dto);

    void deleteList(List<Long> ids);
}
