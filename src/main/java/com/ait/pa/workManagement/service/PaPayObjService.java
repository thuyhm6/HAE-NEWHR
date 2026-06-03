package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaPayObjDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface PaPayObjService {

    List<PaPayObjDto> getList(PaPayObjDto params);

    DataTablesResponse<PaPayObjDto> getPagedList(PaPayObjDto params);

    PaPayObjDto findEmployee(String empId);

    void save(PaPayObjDto dto);

    void saveList(List<PaPayObjDto> items);

    void deleteList(List<PaPayObjDto> keys);
}
