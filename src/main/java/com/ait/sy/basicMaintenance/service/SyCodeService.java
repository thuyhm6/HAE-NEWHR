package com.ait.sy.basicMaintenance.service;

import java.util.List;

import com.ait.sy.basicMaintenance.dto.SyCodeDto;

public interface SyCodeService {
    List<SyCodeDto> getCodeTree();

    List<SyCodeDto> getCodeList(String parentCodeNo);

    void saveCode(SyCodeDto syCodeDto);

    void deleteCode(String codeNo);

    List<SyCodeDto> searchCode(String keyword);

    byte[] exportExcel();
}
