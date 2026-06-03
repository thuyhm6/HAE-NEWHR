package com.ait.pa.salarycode.service;

import com.ait.pa.salarycode.dto.PaSalaryCodeDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface PaSalaryCodeService {

    DataTablesResponse<PaSalaryCodeDto> getPagedList(PaSalaryCodeDto params);

    PaSalaryCodeDto getOne(Integer itemType, String itemNo);

    void save(PaSalaryCodeDto dto);

    void deleteList(List<PaSalaryCodeDto> keys);
}
