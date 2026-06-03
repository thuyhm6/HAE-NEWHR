package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaInputItemDataDto;
import com.ait.pa.salary.dto.PaParamDataTempDto;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PaInputItemDataService {

    List<PaInputItemDataDto> getParamItemList(PaInputItemDataDto dto);

    DataTablesResponse<PaInputItemDataDto> getPagedParamDataList(PaInputItemDataDto dto);

    PaInputItemDataDto getParamDataOne(Long paramDataNo);

    void insertParamData(PaInputItemDataDto dto);

    void updateParamData(PaInputItemDataDto dto);

    void deleteParamData(Long paramDataNo);

    List<String> importParamDataExcel(String paramNo, MultipartFile file);

    List<PaParamDataTempDto> getParamDataTempList(PaParamDataTempDto dto);

    String saveParamDataTemp(String paramNo);
}
